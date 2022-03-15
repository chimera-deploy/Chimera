const { ECSClient, DeregisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs");

const deregisterTaskDefinition = async (taskDefinitionName) => {
  const client = new ECSClient();
  const deregisterTaskDefinitionCommandInput = {
    taskDefinition: taskDefinitionName,
  };

  const command = new DeregisterTaskDefinitionCommand(deregisterTaskDefinitionCommandInput);
  
  try {
    const response = await client.send(command)
    console.log(`Success deregistering Task Definition named ${taskDefinitionName}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR deregistering Task Definition named ${taskDefinitionName}`)
    console.log(err)
    return err
  }
  
}

module.exports = deregisterTaskDefinition;