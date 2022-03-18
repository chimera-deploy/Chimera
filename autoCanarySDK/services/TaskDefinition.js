const { 
  ECSClient, 
  RegisterTaskDefinitionCommand,
  DescribeTaskDefinitionCommand,
  ListTasksCommand,
  DeregisterTaskDefinitionCommand
} = require("@aws-sdk/client-ecs");

const register = async (appImageURL, appContainerName, envoyContainerName, virtualNodeName, originalTaskName, taskName, meshName) => {
  const client = new ECSClient();
  const taskDefinition = await describe(originalTaskName);
  taskDefinition.family = taskName;

  const appContainerDef = taskDefinition.containerDefinitions.find(def => {
    return def.name === appContainerName;
  });
  appContainerDef.image = appImageURL;

  const envoyContainerDef = taskDefinition.containerDefinitions.find(def => {
    return def.name === envoyContainerName;
  });

  const updatedEnvoyEnvironment = envoyContainerDef.environment.map(env => {
    if (env.name !== 'APPMESH_VIRTUAL_NODE_NAME') {
      return env;
    } else {
      return {
        name: 'APPMESH_VIRTUAL_NODE_NAME',
        value: `mesh/${meshName}/virtualNode/${virtualNodeName}`
      }
    }
  });
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