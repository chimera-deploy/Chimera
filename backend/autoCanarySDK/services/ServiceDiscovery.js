const { ServiceDiscoveryClient, GetInstancesHealthStatusCommand } = require("@aws-sdk/client-servicediscovery");
const TaskDefinition = require('./TaskDefinition');

const cloudMapCheckInterval = 5 * 1000;

const getCloudMapHealth = async (serviceDiscoveryID, clientRegion) => {
  const client = new ServiceDiscoveryClient(clientRegion);

  const healthStatusInput = {
    ServiceId: serviceDiscoveryID,
  };

  const command = new GetInstancesHealthStatusCommand(healthStatusInput);
  const response = await client.send(command);
  return response.Status;
};

const allHealthy = (instanceStates, taskIDs) => {
  return taskIDs.length > 0 && taskIDs.every(id => {
    return instanceStates[id] === 'HEALTHY';
  });
};

const cloudMapHealthy = async (serviceDiscoveryID, clusterName, taskName, clientRegion) => {
  const p = new Promise((resolve, reject) => {
    let intervalId;
    let taskIDs = [];
    intervalId = setInterval(async () => {
      const instanceStates = await getCloudMapHealth(serviceDiscoveryID, clientRegion);
      if (taskIDs.length === 0) {
        const taskArns = await TaskDefinition.listTasks(clusterName, taskName, clientRegion);
        taskIDs = taskArns.map(taskArn => {
          const parts = taskArn.split('/');
          return parts[parts.length - 1];
        });
      } else if (allHealthy(instanceStates, taskIDs)) {
        clearInterval(intervalId);
        resolve();
      }
    }, cloudMapCheckInterval);
  });
  await p;
};

module.exports = {
  getCloudMapHealth,
  cloudMapHealthy,
};
