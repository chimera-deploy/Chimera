const { ECSClient, DescribeServicesCommand } = require("@aws-sdk/client-ecs");

const getECSServiceInfo = async (clusterName, originalECSServiceName) => {
  const client = new ECSClient();

  const describeServicesInput = {
    cluster: clusterName,
    services: [ originalECSServiceName ],
  };

  let response;

  try {
    const command = new DescribeServicesCommand(describeServicesInput);
    response = await client.send(command);
  } catch (err) {
    return err;
  }

  if (response === undefined || response.services === undefined || response.services.length === 0) {
    throw new Error('failed to retrieve ECS service info', { cause: response });
  }

  return response.services[0];
};