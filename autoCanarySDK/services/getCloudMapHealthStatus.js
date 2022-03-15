const { ServiceDiscoveryClient, GetInstancesHealthStatusCommand } = require("@aws-sdk/client-servicediscovery");

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

module.exports = getCloudMapHealth;
