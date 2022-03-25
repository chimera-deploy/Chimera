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

  async setup(config) {
    this.config = config;
    try {
      await this.createCWSecurityGroup();
      await this.createCWRoles();
      await this.createCWAgent();
    } catch (err) {
      console.log('setup failed');
      console.log(err);
      throw err
    }
  },

  async createCWSecurityGroup() {
    console.log('creating security group for cloudwatch agent');
    this.cwSecurityGroupID = await EC2.createCWSecurityGroup(this.config.vpcID);
    console.log('created security group for cloudwatch agent');
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
    console.log('creating cloudwatch task role');
    this.cwTaskRole = await IAM.createCWTaskRole(
      this.config.clusterName,
      assumeRolePolicyDocument,
      this.config.region,
      this.config.awsAccountID
    );
    console.log('created cloudwatch task role');
    console.log('creating cloudwatch execution role');
    this.cwExecutionRole = await IAM.createCWExecutionRole(this.config.clusterName, assumeRolePolicyDocument);
    console.log('created cloudwatch execution role');
  },

  async createCWAgent() {
    console.log("registering cloudwatch agent task definition");
    this.cwTaskDefinition = await TaskDefinition.createCW(
      this.config.awsAccountID,
      this.config.metricNamespace,
      this.cwTaskRole,
      this.cwExecutionRole,
    );
    console.log('registered cloudwatch agent task definition');
    console.log("creating cloudwatch agent ECS service");
    this.cwECSService = await ECSService.createCW(
      this.config.clusterName,
      [ this.config.cwSecurityGroupID ],
      this.config.cwECSPrimarySubnets,
      this.cwTaskDefinition
    );
    console.log('created cloudwatch agent ECS service');
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
      newVersionDeployed = true;
    } catch (err) {
      console.log('deployment failed');
      console.log(err);
      await this.rollbackToOldVersion();
    }
    if (newVersionDeployed) {
      try {
        await this.removeOldVersion();
      } catch (err) {
        throw new Error('Failed to remove original version of service', { cause: err });
      }
    }
  },

  async buildCanary() {
    const virtualNodeName = this.config.newNodeName;
    this.taskName = this.config.newTaskDefinitionName;
    this.virtualNode = await VirtualNode.create(this.config.meshName, virtualNodeName, this.config.originalNodeName, this.taskName);
    console.log('created virtual node');
    this.taskDefinition = await TaskDefinition.register(
      this.config.imageURL,
      this.config.containerName,
      virtualNodeName,
      this.config.envoyContainerName,
      this.config.originalTaskDefinition,
      this.taskName,
      this.config.meshName,
      this.config.region,
      this.config.awsAccountID
    );
    console.log('registered task definition');
    this.newECSService = await ECSService.create(this.config.clusterName, this.config.originalECSServiceName, virtualNodeName, this.taskName)
    console.log('created ECS service');
    console.log('waiting for cloudmap');
    await ServiceDiscovery.cloudMapHealthy(this.config.serviceDiscoveryID, this.config.clusterName, this.taskName);
    console.log('finished deploying canary');
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
    console.log(`shifted traffic: Stable: ${originalVersionWeight} || Canary: ${newVersionWeight}`);
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
    console.log(`deleting virtual node ${this.config.originalNodeName}`);
    await VirtualNode.destroy(this.config.meshName, this.config.originalNodeName);
    console.log(`setting desired count for service ${this.config.originalECSServiceName} to 0`);
    await ECSService.update(this.config.clusterName, this.config.originalECSServiceName, 0);
    console.log(`deleting ECS service ${this.config.originalECSServiceName}`);
    await ECSService.destroy(this.config.clusterName, this.config.originalECSServiceName);
    console.log(`deregistering task definition ${this.config.originalTaskDefinition}`);
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
        console.log(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await VirtualNode.destroy(this.config.meshName, this.virtualNode.virtualNodeName);
      }
      if (this.newECSService !== null) {
        console.log(`setting desired count for service ${this.newECSService.serviceName} to 0`);
        await ECSService.update(this.config.clusterName, this.newECSService.serviceName, 0);
        console.log(`deleting ECS service ${this.newECSService.serviceName}`);
        await ECSService.destroy(this.config.clusterName, this.newECSService.serviceName);
      }
      if (this.taskDefinition !== null) {
        const taskDefinitionName = `${this.taskDefinition.family}:${this.taskDefinition.revision}`;
        console.log(`deregistering task definition ${taskDefinitionName}`);
        await TaskDefinition.deregister(taskDefinitionName);
      }
    } catch (err) {
      console.log('Failed to rollback to old version');
      console.log(err);
    }
  },
};

module.exports = Chimera;
