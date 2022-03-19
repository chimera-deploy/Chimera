const {
  ECSClient,
  RegisterTaskDefinitionCommand,
  DescribeTaskDefinitionCommand,
  ListTasksCommand,
  DeregisterTaskDefinitionCommand
} = require("@aws-sdk/client-ecs");

const register = async (appImageURL, appContainerName, virtualNodeName, virtualGatewayName, envoyContainerName, originalTaskName, taskName, meshName, region, account) => {
  const client = new ECSClient();
  const taskDefinition = await describe(originalTaskName);
  taskDefinition.family = taskName;

  if (appImageURL && appContainerName) {
    const appContainerDef = taskDefinition.containerDefinitions.find(def => {
      return def.name === appContainerName;
    });
    appContainerDef.image = appImageURL;
  }

  const envoyContainerDef = taskDefinition.containerDefinitions.find(def => {
    return def.name === envoyContainerName;
  });

  envoyContainerDef.dockerLabels = {
    "ECS_PROMETHEUS_METRICS_PATH": "/stats/prometheus",
    "ECS_PROMETHEUS_EXPORTER_PORT": "9901"
  };

  let updatedEnvoyEnvironment;
  if (virtualNodeName) {
    updatedEnvoyEnvironment = envoyContainerDef.environment.map(env => {
      if (env.name !== "APPMESH_VIRTUAL_NODE_NAME" || env.name !== "APPMESH_RESOURCE_ARN") {
        return env;
      } else {
        return {
          name: "APPMESH_RESOURCE_ARN",
          value: `arn:aws:appmesh:${region}:${account}:mesh/${meshName}/virtualNode/${virtualNodeName}`
        }
      }
    });
  } else {
    updatedEnvoyEnvironment = envoyContainerDef.environment.map(env => {
      if (env.name !== "APPMESH_RESOURCE_ARN") {
        return env;
      } else {
        return {
          name: "APPMESH_RESOURCE_ARN",
          value: `arn:aws:appmesh:${region}:${account}:mesh/${meshName}/virtualGateway/${virtualGatewayName}`
        }
      }
    });
  }
  envoyContainerDef.environment = updatedEnvoyEnvironment;

  const registerTaskDefinitionCommand = new RegisterTaskDefinitionCommand(taskDefinition);

  const response = await client.send(registerTaskDefinitionCommand);
  return response.taskDefinition;
};

const describe = async (taskDefinition) => {
  const input = {
    taskDefinition,
  };
  const client = new ECSClient();
  const command = new DescribeTaskDefinitionCommand(input);
  const response = await client.send(command);
  return response.taskDefinition;
};

const listTasks = async (clusterName, taskFamily) => {
  const input = {
    cluster: clusterName,
    family: taskFamily,
  };
  const client = new ECSClient();
  const command = new ListTasksCommand(input);
  const response = await client.send(command);
  return response.taskArns;
};

const deregister = async (taskDefinitionName) => {
  const client = new ECSClient();
  const deregisterTaskDefinitionCommandInput = {
    taskDefinition: taskDefinitionName,
  };

  const command = new DeregisterTaskDefinitionCommand(deregisterTaskDefinitionCommandInput);
  const response = await client.send(command);
  return response;
};

module.exports = {
  register,
  describe,
  deregister,
  listTasks,
};
