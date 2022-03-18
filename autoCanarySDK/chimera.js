const createVirtualNode = require('./services/createVirtualNode');
const ECSService = require('./services/ECSService');
const registerTaskDefinition = require('./services/registerTaskDefinition');
const updateRoute = require('./services/updateRoute');
const deleteVirtualNode = require('./services/deleteVirtualNode')
const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')
const { cloudMapHealthy } = require('./services/getCloudMapHealthStatus');

const Chimera = {
  virtualNode: null,
  taskDefinition: null,
  ECSService: null,
  config: null,

  async deploy(config) {
    let newVersionDeployed = false;
    this.config = config;
    try {
      await this.buildCanary();
      await this.shiftTraffic(2000, 100);
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
    const vnResponse = await createVirtualNode(this.config.meshName, virtualNodeName, this.config.originalNodeName, taskName);
    this.virtualNode = vnResponse.virtualNode;
    const taskResponse = await registerTaskDefinition(
      this.config.imageURL,
      this.config.containerName,
      this.config.envoyContainerName,
      virtualNodeName,
      this.config.originalTaskDefinition,
      taskName,
      this.config.meshName);
    this.taskDefinition = taskResponse.taskDefinition;
    const serviceResponse = await ECSService.create(this.config.clusterName, this.config.originalECSServiceName, virtualNodeName, taskName)
    this.ECSService = serviceResponse.service;
    await cloudMapHealthy(this.config.serviceDiscoveryID, this.config.clusterName, taskName);
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
          await updateRoute(this.config.meshName, this.config.routeName, this.config.routerName, weightedTargets);
        } catch (err) {
          clearInterval(intervalID);
          reject(new Error('error updating app mesh route', { cause: err }));
        }
        if (healthCheck !== undefined) {
          await healthCheck();
        }
        if (newVersionWeight === 100) {
          resolve();
        }
      }, routeUpdateInterval);
    });
    await p;
  },

  async removeOldVersion() {
    await updateRoute(this.config.meshName, this.config.routeName, this.config.routerName, [
      {
        virtualNode: this.virtualNode.virtualNodeName,
        weight: 100,
      },
    ]);
    console.log(`deleting virtual node ${this.config.originalNodeName}`);
    await deleteVirtualNode(this.config.meshName, this.config.originalNodeName);
    console.log(`setting desired count for service ${this.config.originalECSServiceName} to 0`);
    await ECSService.update(this.config, 0, this.config.originalECSServiceName);
    console.log(`deleting ECS service ${this.config.originalECSServiceName}`);
    await ECSService.destroy(this.config.clusterName, this.config.originalECSServiceName);
    console.log(`deregistering task definition ${this.config.originalTaskDefinition}`);
    await deregisterTaskDefinition(this.config.originalTaskDefinition);
  },

  async rollbackToOldVersion() {
    try {
      await updateRoute(this.config.meshName, this.config.routeName, this.config.routerName, [
        {
          virtualNode: this.config.originalNodeName,
          weight: 100,
        },
      ]);
      if (this.virtualNode !== null) {
        console.log(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await deleteVirtualNode(this.config.meshName, this.virtualNode.virtualNodeName);
      }
      if (this.ECSService !== null) {
        console.log(`setting desired count for service ${this.ECSService.serviceName} to 0`);
        await ECSService.update(this.config, 0, this.ECSService.serviceName);
        console.log(`deleting ECS service ${this.ECSService.serviceName}`);
        await ECSService.destroy(this.config, this.ECSService.serviceName);
      }
      if (this.taskDefinition !== null) {
        const taskDefinitionName = `${this.taskDefinition.family}:${this.taskDefinition.revision}`;
        console.log(`deregistering task definition ${taskDefinitionName}`);
        await deregisterTaskDefinition(taskDefinitionName);
      }
    } catch (err) {
      console.log('Failed to rollback to old version');
      console.log(err);
    }
  },
};

module.exports = Chimera;