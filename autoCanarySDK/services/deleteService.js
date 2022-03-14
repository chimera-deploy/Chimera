const { ECSClient, DeleteServiceCommand } = require("@aws-sdk/client-ecs")

const deleteService = async (clientConfig, clusterARN, serviceName) => {
  const client = new ECSClient(clientConfig)
  const input = {
    cluster: clusterARN,
    service: serviceName
  }

  const command = new DeleteServiceCommand(input)

  try {
    const response = await client.send(command)
    console.log(`Success deleteing Service named ${serviceName}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR deleting Service named ${serviceName}`)
    console.log(err)
    return err
  }  
}

module.exports = deleteService