const { ECSClient, DeregisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs")

const deregisterTaskDefinition = async (clientConfig, taskDefinitionWithRevision) => {
  const client = new ECSClient(clientConfig);
  const deregisterTaskDefinitionCommandInput = {
    taskDefinition: taskDefinitionWithRevision,
  }

  const command = new DeregisterTaskDefinitionCommand(deregisterTaskDefinitionCommandInput);
  
  try {
    const response = await client.send(command)
    console.log(`Success deregistering Task Definition named ${taskDefinition}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR deregistering Task Definition named ${taskDefinition}`)
    console.log(err)
    return err
  }
  
}
// const taskDefinitionWithRevision = 'APP-serviceAv3:1'

// deregisterTaskDefinition({ region: 'us-west-2'}, taskDefinitionWithRevision)

module.exports = deregisterTaskDefinition