const { ECSClient, RegisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs");
const { describeTaskDefinition } = require('../pullInfo/tasks');

const registerTaskDefinition = async (appImageURL, appContainerName, envoyContainerName, virtualNodeName, originalTaskName, taskName, meshName) => {
  const client = new ECSClient();
  const taskDefinition = await describeTaskDefinition(originalTaskName);

  taskDefinition.family = taskName;

  // Set imageURL for app container, this will need to be changed
  // if we allow the user to select multiple containers
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

  try {
    const response = await client.send(registerTaskDefinitionCommand);
    console.log(`Success registering new Task Definition named ${taskName}`);
    return response;
  } catch(err) {
    console.log(`ERROR registering new Task Definition named ${taskName}`);
    console.log(err);
    return err;
  }
}

module.exports = registerTaskDefinition;