const { ECSClient, DeleteServiceCommand, CreateServiceCommand, UpdateServiceCommand, DescribeServicesCommand, ListServicesCommand } = require("@aws-sdk/client-ecs");
const { getIDFromArn } = require("../utils/utils");

const describe = async (clusterName, originalECSServiceName, clientRegion) => {
  const client = new ECSClient(clientRegion);

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

const destroy = async (clusterName, ecsServiceName, clientRegion) => {
  const client = new ECSClient(clientRegion);
  const input = {
    cluster: clusterName,
    service: ecsServiceName,
  };

  const command = new DeleteServiceCommand(input);
  const response = await client.send(command)
  return response;
};

const update = async (clusterName, ecsServiceName, desiredCount, clientRegion) => {
  const client = new ECSClient(clientRegion);
  const updateServiceCommandInput = { cluster: clusterName, service: ecsServiceName, desiredCount };

  const command = new UpdateServiceCommand(updateServiceCommandInput);
  const response = await client.send(command)
  return response;
};

const create = async (clusterName, originalECSServiceName, newECSServiceName, taskName, clientRegion) => {
  const client = new ECSClient(clientRegion);
  const serviceInfo = await describe(clusterName, originalECSServiceName, clientRegion);

  serviceInfo.cluster = clusterName;
  serviceInfo.serviceName = newECSServiceName;
  serviceInfo.taskDefinition = taskName;

  const command = new CreateServiceCommand(serviceInfo);
  const response = await client.send(command)
  return response.service;
};

const createCW = async (cluster, securityGroups, subnets, cwTaskDef, clientRegion) => {
  const client = new ECSClient(clientRegion);
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
        assignPublicIp: "ENABLED",
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

const listServices = async (clusterName, region) => {
  const client = new ECSClient(region);
  const input = {
    cluster: clusterName,
  };
  const command = new ListServicesCommand(input);
  const response = await client.send(command);
  return response.serviceArns.map(getIDFromArn);
};

module.exports = {
  create,
  createCW,
  update,
  destroy,
  describe,
  listServices,
};
