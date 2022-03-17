const { ECSClient, DeleteServiceCommand } = require("@aws-sdk/client-ecs")

const deleteECSService = async (clusterName, ecsServiceName) => {
  const client = new ECSClient()
  const input = {
    cluster: clusterName,
    service: ecsServiceName,
  };

  const command = new DeleteServiceCommand(input)

  try {
    const response = await client.send(command)
    console.log(`Success deleting Service named ${ecsServiceName}`)
    return response
  } catch(err) {
    console.log(`ERROR deleting Service named ${ecsServiceName}`)
    console.log(err)
    return err
  }  
}

module.exports = deleteECSService