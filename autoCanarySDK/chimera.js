const ECSService = require('./services/ECSService');
const VirtualNode = require('./services/VirtualNode');
const TaskDefinition = require('./services/TaskDefinition');
const VirtualRoute = require('./services/VirtualRoute');
const ServiceDiscovery = require('./services/ServiceDiscovery');
const IAM = require('./services/IAM');
const CloudWatch = require('./services/CloudWatch');

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
  newVersionWeight: 0,
  oldVersionWeight: 100,
  shiftWeight: 25,

  async setup(config) {
    this.config = config;
    try {
      await this.createCWRoles();
      await this.createCWAgent();
    } catch (err) {
      console.log('setup failed');
      console.log(err);
    }
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
      this.config.logGroup,
      this.config.region,
      this.config.awsAccountID,
      this.config.metricNamespace,
      this.cwTaskRole,
      this.cwExecutionRole,
    );
    console.log('registered cloudwatch agent task definition');
    console.log("creating cloudwatch agent ECS service");
    this.cwECSService = await ECSService.createCW(
      this.config.clusterName,
      this.config.cwECSSecurityGroups,
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
      await this.shiftTraffic(1000 * 60 * 2, 25, CloudWatch.getHealthCheck); // 2min intervals; 25 shiftweight
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
    // User will have to provide meshName, serviceName and version
    const virtualNodeName = `${this.config.serviceName}-${this.config.newVersionNumber}`
    this.taskName = `${this.config.meshName}-${this.config.serviceName}-${this.config.newVersionNumber}`;
    this.virtualNode = await VirtualNode.create(this.config.meshName, virtualNodeName, this.config.originalNodeName, this.taskName);
    console.log('created virtual node');
    this.taskDefinition = await TaskDefinition.register(
      this.config.imageURL,
      this.config.containerName,
      virtualNodeName,
      null,
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
  },

  async updateTrafficWeights(routeUpdateInterval, shiftWeight, healthCheck, resolve) {
    this.newVersionWeight = Math.min(100, this.newVersionWeight + shiftWeight);
    this.oldVersionWeight = Math.max(0, this.oldVersionWeight - shiftWeight);
    const weightedTargets = [
      {
        virtualNode: this.config.originalNodeName,
        weight: this.originalVersionWeight,
      },
      {
        virtualNode: this.virtualNode.virtualNodeName,
        weight: this.newVersionWeight,
      },
    ];
    await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, weightedTargets);
    await healthCheck(
      routeUpdateInterval,
      this.config.metricNamespace,
      this.config.clusterName,
      this.taskName
    );
    if (this.newVersionWeight >= 100) {
      resolve();
    } else {
      setTimeout(() => this.updateTrafficWeights(
        routeUpdateInterval,
        shiftWeight,
        healthCheck,
        resolve
      ), routeUpdateInterval);
    }
  },

  async shiftTraffic(routeUpdateInterval, shiftWeight, healthCheck) {
    let p = new Promise(async (resolve, reject) => {
      try {
        console.log('attempting to shift traffic');
        await this.updateTrafficWeights(10000, shiftWeight, healthCheck, resolve);
      } catch (err) {
        console.log("failed to shift traffic");
        reject(new Error('error updating app mesh route', { cause: err }));
      }
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
    await ECSService.update(this.config, this.config.originalECSServiceName, null, 0);
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
        await ECSService.update(this.config, this.newECSService.serviceName, null, 0);
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
