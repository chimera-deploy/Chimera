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
  config: null,
  gatewayTaskDefinition: null,
  cwTaskRole: null,
  cwExecutionRole: null,
  cwTaskDefinition: null,
  cwECSService: null,

  async setup(config) {
    this.config = config;
    try {
      await this.updateGateway();
      await this.createCWRoles();
      await this.createCWAgent();
    } catch (err) {
      console.log('setup failed');
      console.log(err);
    }
  },

  async updateGateway() {
    console.log("updating gateway task definition");
    this.gatewayTaskDefinition = await TaskDefinition.register(
      null,
      null,
      null,
      this.config.virtualGatewayName,
      this.config.envoyContainerName,
      this.config.originalGatewayTaskDefinition,
      this.config.originalGatewayTaskDefinition.split(":")[0],
      this.config.meshName,
      this.config.region,
      this.config.awsAccountID
    );
    console.log('updated gateway task definition');
    console.log('updating ecs gateway service');
    await ECSService.update(
      this.config,
      this.config.originalGatewayECSServiceName,
      this.gatewayTaskDefinition,
      null
    );
    console.log('updated ecs gateway service');
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
      await this.shiftTraffic(1000 * 60 * 3, 20, CloudWatch.getHealthCheck); // 3min intervals; 20 shiftweight
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
    const taskName = `${this.config.meshName}-${this.config.serviceName}-${this.config.newVersionNumber}`;
    this.virtualNode = await VirtualNode.create(this.config.meshName, virtualNodeName, this.config.originalNodeName, taskName);
    console.log('created virtual node');
    this.taskDefinition = await TaskDefinition.register(
      this.config.imageURL,
      this.config.containerName,
      virtualNodeName,
      null,
      this.config.envoyContainerName,
      this.config.originalTaskDefinition,
      taskName,
      this.config.meshName,
      this.config.region,
      this.config.awsAccountID
    );
    console.log('registered task definition');
    this.newECSService = await ECSService.create(this.config.clusterName, this.config.originalECSServiceName, virtualNodeName, taskName)
    console.log('created ECS service');
    console.log('waiting for cloudmap');
    await ServiceDiscovery.cloudMapHealthy(this.config.serviceDiscoveryID, this.config.clusterName, taskName);
  },

  async shiftTraffic(routeUpdateInterval, shiftWeight, healthCheck) {
    let p = new Promise((resolve, reject) => {
      let originalVersionWeight = 100;
      let newVersionWeight = 0;
      let intervalID;
      intervalID = setInterval(async () => {
        newVersionWeight += shiftWeight;
        originalVersionWeight -= shiftWeight;
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
        if (newVersionWeight === 100) {
          clearInterval(intervalID);
        }
        try {
          console.log('attempting to shift traffic');
          await VirtualRoute.update(this.config.meshName, this.config.routeName, this.config.routerName, weightedTargets);
        } catch (err) {
          console.log("failed to shift traffic");
          clearInterval(intervalID);
          reject(new Error('error updating app mesh route', { cause: err }));
          return
        }
        console.log("shifted traffic");
        try {
          console.log("attempting healthcheck");
          await healthCheck(routeUpdateInterval, this.config.metricNamespace, `${this.config.serviceName}-${this.config.newVersionNumber}`);
        } catch (err) {
          console.log("healthcheck failure");
          clearInterval(intervalID);
          reject(err);
          return
        }
        console.log("healthcheck pass");
        if (newVersionWeight === 100) {
          resolve();
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
