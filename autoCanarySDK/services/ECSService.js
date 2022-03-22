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

const update = async (clusterName, ecsServiceName, desiredCount) => {
  const client = new ECSClient();
  const updateServiceCommandInput = { cluster: clusterName, service: ecsServiceName, desiredCount };

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

const createCW = async (cluster, securityGroups, subnets, cwTaskDef) => {
  const client = new ECSClient();
  const input = {
    cluster,
    deploymentConfiguration: {
      maximumPercent: 200,
      minimumHealthyPercent: 100
    },
    desiredCount: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "DISABLED",
        securityGroups,
        subnets
      }
    },
    serviceName: `${cluster}-cw-agent`,
    taskDefinition: `${cwTaskDef.family}`
  };
  const command = new CreateServiceCommand(input);
  const response = await client.send(command);
  return response.service;
};

module.exports = {
  create,
  createCW,
  update,
  destroy,
  describe,
};
