const createVirtualNode = require('./services/createVirtualNode');
const createECSService = require('./services/createECSService');
const registerTaskDefinition = require('./services/registerTaskDefinition');
const updateRoute = require('./services/updateRoute');
const deleteVirtualNode = require('./services/deleteVirtualNode')
const updateECSService = require('./services/updateECSService')
const deleteECSService = require('./services/deleteECSService')
const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')
const { currentCloudmapInstanceCount, cloudMapHealthy } = require('./services/getCloudMapHealthStatus');

const Chimera = {
  virtualNode: null,
  taskDefinition: null,
  ECSService: null,
  config: null,

  async deploy(config) {
    this.config = config;
    try {
      await this.buildCanary();
      await this.shiftTraffic(2000, 100);
      await this.removeOldVersion();
    } catch (err) {
      console.log('deployment failed');
      console.log(err);
      this.rollbackToOldVersion();
    }
  },

  async buildCanary() {
    const originalInstanceCount = await currentCloudmapInstanceCount(this.config.serviceDiscoveryID);
    const virtualNodeName = `${this.config.serviceName}-${this.config.newVersionNumber}`
    const taskName = `${this.config.meshName}-${this.config.serviceName}-${this.config.newVersionNumber}`;
    try {
      const vnResponse = await createVirtualNode(this.config, virtualNodeName, taskName);
      this.virtualNode = vnResponse.virtualNode;
      const taskResponse = await registerTaskDefinition(this.config, virtualNodeName, taskName);
      this.taskDefinition = taskResponse.taskDefinition;
      const serviceResponse = await createECSService(this.config, virtualNodeName, taskName)
      this.ECSService = serviceResponse.service;
      await cloudMapHealthy(this.config.serviceDiscoveryID, originalInstanceCount);
    } catch (err) {
      console.log(err, 'rolling back');
      rollbackToOldVersion();
    }
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
        await updateRoute(this.config, weightedTargets);
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
    try {
      await updateRoute(this.config, [
        {
          virtualNode: this.virtualNode.virtualNodeName,
          weight: 100}
        ]
      );
      console.log(`deleting virtual node ${this.config.originalNodeName}`);
      await deleteVirtualNode(this.config, this.config.originalNodeName);
      console.log(`setting desired count for service ${this.config.originalECSServiceName} to 0`);
      await updateECSService(this.config, 0, this.config.originalECSServiceName);
      console.log(`deleting ECS service ${this.config.originalECSServiceName}`);
      await deleteECSService(this.config, this.config.originalECSServiceName);
      console.log(`deregistering task definition ${this.config.originalTaskDefinition}`);
      await deregisterTaskDefinition(this.config.originalTaskDefinition);
    } catch (err) {
      console.log('failed to remove old version');
      console.log(err);
    }
  },

  async rollbackToOldVersion() {
    try {
      if (this.virtualNode !== null) {
        console.log(`deleting virtual node ${this.virtualNode.virtualNodeName}`);
        await deleteVirtualNode(this.config, this.virtualNode.virtualNodeName);
      }
      if (this.ECSService !== null) {
        console.log(`setting desired count for service ${this.ECSService.serviceName} to 0`);
        await updateECSService(this.config, 0, this.ECSService.serviceName);
        console.log(`deleting ECS service ${this.ECSService.serviceName}`);
        await deleteECSService(this.config, this.ECSService.serviceName);
      }
      // if (this.taskDefinition !== null) {
      //   console.log(`deregistering task definition ${this.taskDefinition.}`);
      //   await deregisterTaskDefinition(this.config.originalTaskDefinition);
      // }
    } catch (err) {
      console.log('failed to remove old version');
      console.log(err);
    }
  },
};

module.exports = Chimera;