const { ServiceDiscoveryClient, GetInstancesHealthStatusCommand } = require("@aws-sdk/client-servicediscovery");

const cloudMapCheckInterval = 5 * 1000;

const getCloudMapHealth = async (serviceDiscoveryID) => {
  const client = new ServiceDiscoveryClient();

  const healthStatusInput = {
    ServiceId: serviceDiscoveryID,
  };

  const command = new GetInstancesHealthStatusCommand(healthStatusInput);
  try {
    const response = await client.send(command)
    return response.Status;
  } catch(err) {
    console.log(err)
    return err
  }
};

const currentCloudmapInstanceCount = async (serviceDiscoveryID) => {
  const health = await getCloudMapHealth(serviceDiscoveryID);
  return Object.values(health).length;
};

const cloudMapHealthy = async (serviceDiscoveryID, originalInstanceCount) => {
  const p = new Promise((resolve, reject) => {
    let intervalId;
    intervalId = setInterval(async () => {
      const updatedInstanceHealth = await getCloudMapHealth(serviceDiscoveryID);
      const allHealthy = Object.values(updatedInstanceHealth).every(status => status === 'HEALTHY');
      if (Object.values(updatedInstanceHealth).length !== originalInstanceCount && allHealthy) {
        clearInterval(intervalId);
        resolve();
      }
    }, cloudMapCheckInterval);
  });
  await p;
};

module.exports = {
  getCloudMapHealth,
  currentCloudmapInstanceCount,
  cloudMapHealthy,
};
