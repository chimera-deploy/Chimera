const { ECSClient, CreateServiceCommand } = require("@aws-sdk/client-ecs")

const createService = async (clientConfig, clusterName, securityGroups, subnets, newServiceName, taskName, containerName, registryArn) => {
  const client = new ECSClient(clientConfig)

  const createServiceInput = {
    cluster: clusterName,
    desiredCount: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        securityGroups: securityGroups, // string[]
        subnets: subnets, // string[]
      }
    },
    serviceName: newServiceName,
    serviceRegistries: [
      {
        containerName: containerName,
        registryArn: registryArn // was only able to discover by using getService.js, find via the service ID of the cloud map service name to use
      }
    ],
    taskDefinition: taskName
  }

  const command = new CreateServiceCommand(createServiceInput)
  try {
    const response = await client.send(command)
    console.log(`Success creating new Service named ${newServiceName}`)
    console.log(response)
    return response
  } catch(err){
    console.log(`ERROR creating new Service named ${newServiceName}`)
    console.log(err)
    return err
  }  
}

module.exports = createService