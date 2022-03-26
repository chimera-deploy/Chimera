const ECSService = require('./services/ECSService');
const VirtualNode = require('./services/VirtualNode');
const TaskDefinition = require('./services/TaskDefinition');
const VirtualRoute = require('./services/VirtualRoute');
const ServiceDiscovery = require('./services/ServiceDiscovery');
const IAM = require('./services/IAM');
const CloudWatch = require('./services/CloudWatch');
const EC2 = require('./services/EC2');

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
  newVersionWeight: 0,
  oldVersionWeight: 100,
  shiftWeight: 25,
  client: null,
  events: [],

  async registerClient(newClient) {
    this.client = newClient;
  },

  async writeToClient(message) {
    console.log(message);
    this.events.push(message);
    if (this.client) {
      this.client.response.write(`data: ${JSON.stringify(this.events)}\n\n`);
    }
  },

  async setup(config) {
    this.config = config;
    try {
      await this.createCWSecurityGroup();
      await this.createCWRoles();
      await this.createCWAgent();
    } catch (err) {
      this.writeToClient('setup failed');
      console.log(err);
      throw err
    }
  },

  async createCWSecurityGroup() {
    this.writeToClient('creating security group for cloudwatch agent');
    this.writeToClient()
    this.cwSecurityGroupID = await EC2.createCWSecurityGroup(this.config.vpcID);
    this.writeToClient('created security group for cloudwatch agent');
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
    this.writeToClient('creating cloudwatch task role');
    this.cwTaskRole = await IAM.createCWTaskRole(
      this.config.clusterName,
      assumeRolePolicyDocument,
      this.config.region,
      this.config.awsAccountID
    );
    this.writeToClient('created cloudwatch task role');
    this.writeToClient('creating cloudwatch execution role');
    this.cwExecutionRole = await IAM.createCWExecutionRole(this.config.clusterName, assumeRolePolicyDocument);
    this.writeToClient('created cloudwatch execution role');
  },

  async createCWAgent() {
    this.writeToClient("registering cloudwatch agent task definition");
    this.cwTaskDefinition = await TaskDefinition.createCW(
      this.config.awsAccountID,
      this.config.metricNamespace,
      this.cwTaskRole,
      this.cwExecutionRole,
    );
    this.writeToClient('registered cloudwatch agent task definition');
    this.writeToClient("creating cloudwatch agent ECS service");
    this.cwECSService = await ECSService.createCW(
      this.config.clusterName,
      [ this.config.cwSecurityGroupID ],
      this.config.cwECSPrimarySubnets,
      this.cwTaskDefinition
    );
    this.writeToClient('created cloudwatch agent ECS service');
  },

  async deploy(config) {
    let newVersionDeployed = false;
    this.config = config;
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
      console.log(err);
      await this.rollbackToOldVersion();
      this.writeToClient('rollback succesfull')
      this.writeToClient('closing connection')
    }
    if (newVersionDeployed) {
      try {
        await this.removeOldVersion();
        this.writeToClient('old version succesfully removed')
        this.writeToClient('closing connection')
      } catch (err) {
        this.writeToClient('closing connection');
        throw new Error('Failed to remove original version of service', { cause: err });
      }
    }
  },

  async buildCanary() {
    const virtualNodeName = this.config.newNodeName;
    this.taskName = this.config.newTaskDefinitionName;
    this.virtualNode = await VirtualNode.create(this.config.meshName, virtualNodeName, this.config.originalNodeName, this.taskName);
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
      this.config.awslogsStreamPrefix
    );
    this.writeToClient('registered task definition');
    this.newECSService = await ECSService.create(this.config.clusterName, this.config.originalECSServiceName, virtualNodeName, this.taskName)
    this.writeToClient('created ECS service');
    this.writeToClient('waiting for cloudmap');
    await ServiceDiscovery.cloudMapHealthy(this.config.serviceDiscoveryID, this.config.clusterName, this.taskName);
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
    await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, weightedTargets);
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

      let intervalID;
      intervalID = setInterval(async () => {
        try {
          if (healthCheck !== undefined) {
            await healthCheck(
              routeUpdateInterval,
              this.config.metricNamespace,
              this.config.clusterName,
              this.taskName,
              maxFailures
            );
          }
          if (newVersionWeight === 100) {
            clearInterval(intervalID);
            resolve();
            return
          }

          newVersionWeight = Math.min(100, newVersionWeight + shiftWeight);
          originalVersionWeight = Math.max(0, originalVersionWeight - shiftWeight);

          await this.updateRoute(newVersionWeight, originalVersionWeight);
        } catch (err) {
          clearInterval(intervalID);
          reject(err);
        }
      }, routeUpdateInterval);
    });
    await p;
  },

  async removeOldVersion() {
    await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, [
      {
        virtualNode: this.virtualNode.virtualNodeName,
        weight: 100,
      },
    ]);
    this.writeToClient(`deleting virtual node ${this.config.originalNodeName}`);
    await VirtualNode.destroy(this.config.meshName, this.config.originalNodeName);
    this.writeToClient(`setting desired count for service ${this.config.originalECSServiceName} to 0`);
    await ECSService.update(this.config.clusterName, this.config.originalECSServiceName, 0);
    this.writeToClient(`deleting ECS service ${this.config.originalECSServiceName}`);
    await ECSService.destroy(this.config.clusterName, this.config.originalECSServiceName);
    this.writeToClient(`deregistering task definition ${this.config.originalTaskDefinition}`);
    await TaskDefinition.deregister(this.config.originalTaskDefinition);
  },

  async rollbackToOldVersion() {
    try {
      await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, [
        {
          virtualNode: this.config.originalNodeName,
          weight: 100,
        },
      ]);
      if (this.virtualNode !== null) {
        this.writeToClient(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await VirtualNode.destroy(this.config.meshName, this.virtualNode.virtualNodeName);
      }
      if (this.newECSService !== null) {
        this.writeToClient(`setting desired count for service ${this.newECSService.serviceName} to 0`);
        await ECSService.update(this.config.clusterName, this.newECSService.serviceName, 0);
        this.writeToClient(`deleting ECS service ${this.newECSService.serviceName}`);
        await ECSService.destroy(this.config.clusterName, this.newECSService.serviceName);
      }
      if (this.taskDefinition !== null) {
        const taskDefinitionName = `${this.taskDefinition.family}:${this.taskDefinition.revision}`;
        this.writeToClient(`deregistering task definition ${taskDefinitionName}`);
        await TaskDefinition.deregister(taskDefinitionName);
        this.writeToClient(`rollback to ${this.config.originalNodeName} complete`)
      }
    } catch (err) {
      this.writeToClient('Failed to rollback to old version');
      console.log(err);
    }
  },
};

module.exports = Chimera;
