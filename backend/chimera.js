const ECSService = require('./services/ECSService');
const VirtualNode = require('./services/VirtualNode');
const TaskDefinition = require('./services/TaskDefinition');
const VirtualRoute = require('./services/VirtualRoute');
const ServiceDiscovery = require('./services/ServiceDiscovery');
const logger = require('./utils/logger');

const IAM = require('./services/IAM');
const CloudWatch = require('./services/CloudWatch');
const EC2 = require('./services/EC2');
const { LaunchTemplateHibernationOptions } = require('@aws-sdk/client-ec2');

const HEALTHCHECK_INTERVAL = 1000 * 60;

const Chimera = {
  virtualNode: null,
  taskDefinition: null,
  newECSService: null,
  taskName: null,
  config: null,
  gatewayTaskDefinition: null,
  cwTaskRole: null,
  cwExecutionRole: null,
  cwTaskDefinition: null,
  cwECSService: null,
  cwSecurityGroupID: null,
  clientList: [],
  events: [],
  healthCheckLoop: null,
  routeUpdateLoop: null,

  registerClient(client) {
    this.clientList.push(client);
  },

  endEventStream() {
    this.writeToClient("closing connection");
    this.clientList.forEach(client =>{
      client.response.end();
    });
    this.clientList = [];
    this.events = [];
  },

  sendMetricsWidget(metricsWidget) {
    this.clientList.forEach(client => {
      console.log("Sending updated Widget Image");
      const data = JSON.stringify({ metricsWidget });
      client.response.write(`data: ${data}\n\n`);
    });
  },

  writeToClient(message) {
    console.log(message);
    this.events = [...this.events, message];
    this.clientList.forEach(client => {
      console.log(`sending event to client ${client.id}`)
      const data = JSON.stringify({events: this.events});
      client.response.write(`data: ${data}\n\n`);
    });
  },

  async setup(config) {
    this.config = config;
    this.config.clientRegion = {region: config.region };

    try {
      await this.createCWSecurityGroup();
      await this.createCWRoles();
      await this.createCWAgent();
    } catch (err) {
      logger.error(err);
      throw err
    }
  },

  async createCWSecurityGroup() {
    logger.info('creating security group for cloudwatch agent');
    this.cwSecurityGroupID = await EC2.createCWSecurityGroup(this.config.vpcID, this.config.clientRegion);
    logger.info('created security group for cloudwatch agent');
  },

  async createCWRoles() {
    const assumeRolePolicyDocument = JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    });
    logger.info('creating cloudwatch task role');
    this.cwTaskRole = await IAM.createCWTaskRole(
      this.config.clusterName,
      assumeRolePolicyDocument,
      this.config.region,
      this.config.awsAccountID,
      this.config.clientRegion
    );
    logger.info('created cloudwatch task role');
    logger.info('creating cloudwatch execution role');
    this.cwExecutionRole = await IAM.createCWExecutionRole(this.config.clusterName, assumeRolePolicyDocument, this.config.clientRegion);
    logger.info('created cloudwatch execution role');
  },

  async createCWAgent() {
    logger.info("registering cloudwatch agent task definition");
    this.cwTaskDefinition = await TaskDefinition.createCW(
      this.config.awsAccountID,
      this.config.metricNamespace,
      this.cwTaskRole,
      this.cwExecutionRole,
      this.config.clientRegion
    );
    logger.info('registered cloudwatch agent task definition');
    logger.info("creating cloudwatch agent ECS service");
    this.cwECSService = await ECSService.createCW(
      this.config.clusterName,
      [ this.config.cwSecurityGroupID ],
      this.config.cwECSPrimarySubnets,
      this.cwTaskDefinition,
      this.config.clientRegion
    );
    logger.info('created cloudwatch agent ECS service');
  },

  async deploy(config) {
    let newVersionDeployed = false;
    this.config = config;
    this.config.clientRegion = { region: this.config.region }

    try {
      await this.buildCanary();
      await this.shiftTraffic(
        1000 * 60 * Number(config.routeUpdateInterval),
        Number(config.shiftWeight),
        CloudWatch.getHealthCheck,
        Number(config.maxFailures)
      );
      this.writeToClient('canary successfully deployed and stable')
      newVersionDeployed = true;
    } catch (err) {
      this.writeToClient('deployment failed');
      logger.error(err);
      await this.rollbackToOldVersion();
      this.writeToClient('rollback succesfull');
      this.endEventStream();
    }
    if (newVersionDeployed) {
      try {
        await this.removeOldVersion();
        this.writeToClient('old version succesfully removed')
        this.endEventStream();
      } catch (err) {
        this.endEventStream();
        throw new Error('Failed to remove original version of service', { cause: err });
      }
    }
  },

  async buildCanary() {
    const virtualNodeName = this.config.newNodeName;
    this.taskName = this.config.newTaskDefinitionName;
    this.virtualNode = await VirtualNode.create(this.config.meshName, virtualNodeName, this.config.originalNodeName, this.taskName, this.config.clientRegion);
    this.writeToClient('created virtual node');
    this.taskDefinition = await TaskDefinition.register(
      this.config.imageURL,
      this.config.containerName,
      virtualNodeName,
      this.config.envoyContainerName,
      this.config.originalTaskDefinition,
      this.taskName,
      this.config.meshName,
      this.config.region,
      this.config.awsAccountID,
      this.config.clientRegion,
      this.config.awslogsStreamPrefix
    );

    this.writeToClient('registered task definition');
    this.newECSService = await ECSService.create(this.config.clusterName, this.config.originalECSServiceName, virtualNodeName, this.taskName, this.config.clientRegion)
    this.writeToClient('created ECS service');
    this.writeToClient('waiting for cloudmap');
    await ServiceDiscovery.cloudMapHealthy(this.config.serviceDiscoveryID, this.config.clusterName, this.taskName, this.config.clientRegion);
    this.writeToClient('canary running on ECS');
  },

  async updateRoute(newVersionWeight, originalVersionWeight) {
    const weightedTargets = [
      {
        virtualNode: this.config.originalNodeName,
        weight: originalVersionWeight,
      },
      {
        virtualNode: this.virtualNode.virtualNodeName,
        weight: newVersionWeight,
      },
    ];
    await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, weightedTargets, this.config.clientRegion);
    this.writeToClient(`shifted traffic: Stable: ${originalVersionWeight} || Canary: ${newVersionWeight}`);
  },

  async shiftTraffic(routeUpdateInterval, shiftWeight, healthCheck, maxFailures) {
    let p = new Promise(async (resolve, reject) => {
      let originalVersionWeight = Math.max(0, 100 - shiftWeight);
      let newVersionWeight = Math.min(100, 0 + shiftWeight);

      try {
        await this.updateRoute(newVersionWeight, originalVersionWeight);
      } catch (err) {
        reject(err);
      }

      this.routeUpdateLoop = setInterval(async () => {
        try {
          if (newVersionWeight === 100) {
            clearInterval(this.routeUpdateLoop);
            clearInterval(this.healthCheckLoop);
            resolve();
            return
          }

          newVersionWeight = Math.min(100, newVersionWeight + shiftWeight);
          originalVersionWeight = Math.max(0, originalVersionWeight - shiftWeight);

          await this.updateRoute(newVersionWeight, originalVersionWeight);
        } catch (err) {
          clearInterval(this.routeUpdateLoop);
          clearInterval(this.healthCheckLoop);
          reject(err);
        }
      }, routeUpdateInterval);

      this.healthCheckLoop = setInterval(async () =>{
        try {
          if (healthCheck !== undefined) {
            await healthCheck(
              HEALTHCHECK_INTERVAL,
              this.config.metricNamespace,
              this.config.clusterName,
              this.taskName,
              maxFailures,
              this.config.clientRegion
            );
          }
          const metricsWidget = await CloudWatch.getMetricWidgetImage(this.config);
          this.sendMetricsWidget(metricsWidget);
        } catch (err) {
          clearInterval(this.routeUpdateLoop);
          clearInterval(this.healthCheckLoop);
          reject(err);
        }
      }, HEALTHCHECK_INTERVAL);
    });

    await p;
  },

  async removeOldVersion() {
    await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName,
      [
        {
          virtualNode: this.virtualNode.virtualNodeName,
          weight: 100,
        },
      ],
      this.config.clientRegion
    );
    this.writeToClient(`deleting virtual node ${this.config.originalNodeName}`);
    await VirtualNode.destroy(this.config.meshName, this.config.originalNodeName, this.config.clientRegion);
    this.writeToClient(`setting desired count for service ${this.config.originalECSServiceName} to 0`);
    await ECSService.update(this.config.clusterName, this.config.originalECSServiceName, 0, this.config.clientRegion);
    this.writeToClient(`deleting ECS service ${this.config.originalECSServiceName}`);
    await ECSService.destroy(this.config.clusterName, this.config.originalECSServiceName, this.config.clientRegion);
    this.writeToClient(`deregistering task definition ${this.config.originalTaskDefinition}`);
    await TaskDefinition.deregister(this.config.originalTaskDefinition, this.config.clientRegion);
  },

  async abort() {
    await this.rollbackToOldVersion();
    this.endEventStream();
  },

  async rollbackToOldVersion() {
    clearInterval(this.routeUpdateLoop);
    clearInterval(this.healthCheckLoop);

    try {
      await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName,
        [
          {
            virtualNode: this.config.originalNodeName,
            weight: 100,
          },
        ],
        this.config.clientRegion
      );
      if (this.virtualNode !== null) {
        this.writeToClient(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await VirtualNode.destroy(this.config.meshName, this.virtualNode.virtualNodeName, this.config.clientRegion);
      }
      if (this.newECSService !== null) {
        this.writeToClient(`setting desired count for service ${this.newECSService.serviceName} to 0`);
        await ECSService.update(this.config.clusterName, this.newECSService.serviceName, 0, this.config.clientRegion);
        this.writeToClient(`deleting ECS service ${this.newECSService.serviceName}`);
        await ECSService.destroy(this.config.clusterName, this.newECSService.serviceName, this.config.clientRegion);
      }
      if (this.taskDefinition !== null) {
        const taskDefinitionName = `${this.taskDefinition.family}:${this.taskDefinition.revision}`;
        this.writeToClient(`deregistering task definition ${taskDefinitionName}`);
        await TaskDefinition.deregister(taskDefinitionName, this.config.clientRegion);
        this.writeToClient(`rollback to ${this.config.originalNodeName} complete`)
      }
    } catch (err) {
      this.writeToClient('Failed to rollback to old version');
      logger.error(err);
    }
  },
};

module.exports = Chimera;
