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
  cloudMapLoop: null,
  cloudMapPromiseReject: null,
  shiftTrafficPromiseReject: null,

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
    logger.info("Sending updated Widget Image");
    const data = JSON.stringify({ metricsWidget });

    this.clientList.forEach(client => {
      client.response.write(`data: ${data}\n\n`);
    });
  },

  sendWeights(stable, canary) {
    this.writeToClient(`Updated Weights: stable: ${stable} | Canary ${canary}`);
    const weights = { stable, canary };
    const data = JSON.stringify({ weights })
    this.clientList.forEach(client => {
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

  rejectOpenPromises() {
    if (this.shiftTrafficPromiseReject) {
      this.shiftTrafficPromiseReject();
    }
    if (this.cloudMapPromiseReject) {
      this.cloudMapPromiseReject();
    }
  },

  clearAllIntervals() {
    clearInterval(this.healthCheckLoop);
    clearInterval(this.routeUpdateLoop);
    clearInterval(this.cloudMapLoop);
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
      this.endEventStream();
    }
    if (newVersionDeployed) {
      try {
        await this.removeOldVersion();
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
    await this.allServicesDiscoverable();
    this.writeToClient('canary running on ECS');
  },

  async allServicesDiscoverable() {
    const cloudMapCheckInterval = 5 * 1000;

    const p = new Promise((resolve, reject) => {
      let taskIDs = [];
      this.cloudMapPromiseReject = reject;
      this.cloudMapLoop = setInterval(async () => {
        const instanceStates = await ServiceDiscovery.getCloudMapHealth(this.config.serviceDiscoveryID, this.config.clientRegion);
        if (taskIDs.length === 0) {
          const taskArns = await TaskDefinition.listTasks(this.config.clusterName, this.taskName, this.config.clientRegion);
          taskIDs = taskArns.map(taskArn => {
            const parts = taskArn.split('/');
            return parts[parts.length - 1];
          });
        } else if (ServiceDiscovery.allHealthy(instanceStates, taskIDs)) {
          clearInterval(this.cloudMapLoop);
          resolve();
        }
      }, cloudMapCheckInterval);
    });
    await p
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
    this.sendWeights(originalVersionWeight, newVersionWeight);
  },

  async shiftTraffic(routeUpdateInterval, shiftWeight, healthCheck, maxFailures) {
    let p = new Promise(async (resolve, reject) => {
      let originalVersionWeight = Math.max(0, 100 - shiftWeight);
      let newVersionWeight = Math.min(100, 0 + shiftWeight);
      this.shiftTrafficPromiseReject = reject;

      try {
        await this.updateRoute(newVersionWeight, originalVersionWeight);
      } catch (err) {
        reject(err);
      }

      this.routeUpdateLoop = setInterval(async () => {
        try {
          if (newVersionWeight === 100) {
            this.clearAllIntervals();
            resolve();
            return
          }

          newVersionWeight = Math.min(100, newVersionWeight + shiftWeight);
          originalVersionWeight = Math.max(0, originalVersionWeight - shiftWeight);

          await this.updateRoute(newVersionWeight, originalVersionWeight);
        } catch (err) {
          this.clearAllIntervals();
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
          this.clearAllIntervals();
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
    this.writeToClient('old version succesfully removed');
  },

  abort() {
    this.rejectOpenPromises();
  },

  async rollbackToOldVersion() {
    this.clearAllIntervals();

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
      this.sendWeights(100, 0);
      if (this.virtualNode !== null) {
        this.writeToClient(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await VirtualNode.destroy(this.config.meshName, this.virtualNode.virtualNodeName, this.config.clientRegion);
        this.virtualNode = null;
      }
      if (this.newECSService !== null) {
        this.writeToClient(`setting desired count for service ${this.newECSService.serviceName} to 0`);
        await ECSService.update(this.config.clusterName, this.newECSService.serviceName, 0, this.config.clientRegion);
        this.writeToClient(`deleting ECS service ${this.newECSService.serviceName}`);
        await ECSService.destroy(this.config.clusterName, this.newECSService.serviceName, this.config.clientRegion);
        this.newECSService = null;
      }
      if (this.taskDefinition !== null) {
        const taskDefinitionName = `${this.taskDefinition.family}:${this.taskDefinition.revision}`;
        this.writeToClient(`deregistering task definition ${taskDefinitionName}`);
        await TaskDefinition.deregister(taskDefinitionName, this.config.clientRegion);
        this.writeToClient(`rollback to ${this.config.originalNodeName} complete`)
        this.taskDefinition = null;
      }
    } catch (err) {
      this.writeToClient('Failed to rollback to old version');
      logger.error(err);
    }
  },
};

module.exports = Chimera;
