const { ServiceDiscoveryClient, GetInstancesHealthStatusCommand } = require("@aws-sdk/client-servicediscovery");

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

module.exports = {
  getCloudMapHealth,
  allHealthy,
};
