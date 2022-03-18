const { ECSClient, DeleteServiceCommand, CreateServiceCommand, UpdateServiceCommand, DescribeServicesCommand } = require("@aws-sdk/client-ecs")

const describe = async (clusterName, originalECSServiceName) => {
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

const destroy = async (clusterName, ecsServiceName) => {
  const client = new ECSClient();
  const input = {
    cluster: clusterName,
    service: ecsServiceName,
  };

  const command = new DeleteServiceCommand(input);
  const response = await client.send(command)
  return response;
};

const update = async (chimeraConfig, desiredCount, ecsServiceName) => {
  const client = new ECSClient();
  const updateServiceCommandInput = {
    cluster: chimeraConfig.clusterName,
    desiredCount,
    service: ecsServiceName,
  };
  const command = new UpdateServiceCommand(updateServiceCommandInput);
  const response = await client.send(command)
  return response;
};

const create = async (clusterName, originalECSServiceName, newECSServiceName, taskName) => {
  const client = new ECSClient();
  const serviceInfo = await describe(clusterName, originalECSServiceName);

  serviceInfo.cluster = clusterName;
  serviceInfo.serviceName = newECSServiceName;
  serviceInfo.taskDefinition = taskName;

  const command = new CreateServiceCommand(serviceInfo);
  const response = await client.send(command)
  return response.service;
};

module.exports = {
  create,
  update,
  destroy,
  describe,
};