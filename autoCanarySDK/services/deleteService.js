const { ECSClient, DeleteServiceCommand } = require("@aws-sdk/client-ecs")

const deleteECSService = async (chimeraConfig, ecsServiceName) => {
  const client = new ECSClient()
  const input = {
    cluster: chimeraConfig.clusterARN,
    service: ecsServiceName,
  };

  const command = new DeleteServiceCommand(input)

  try {
    const response = await client.send(command)
    console.log(`Success deleteing Service named ${ecsServiceName}`)
    return response
  } catch(err) {
    console.log(`ERROR deleting Service named ${ecsServiceName}`)
    console.log(err)
    return err
  }  
}

module.exports = deleteECSService