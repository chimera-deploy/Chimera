const { ECSClient, CreateServiceCommand } = require("@aws-sdk/client-ecs")

const createService = async (chimeraConfig, taskName, virtualNodeName) => {
  const client = new ECSClient();
  
  const newServiceName = `${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`;

  const createServiceInput = {
    cluster: chimeraConfig.clusterName,
    desiredCount: Number(chimeraConfig.numInstances),
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        securityGroups: chimeraConfig.securityGroups,
        subnets: chimeraConfig.subnets,
      }
    },
    serviceName: virtualNodeName,
    serviceRegistries: [
      {
        registryArn: chimeraConfig.serviceRegistryARN,
      }
    ],
    taskDefinition: taskName
  }

  const command = new CreateServiceCommand(createServiceInput)
  try {
    const response = await client.send(command)
    console.log(`Success creating new Service named ${newServiceName}`)
    return response
  } catch(err){
    console.log(`ERROR creating new Service named ${newServiceName}`)
    console.log(err)
    return err
  }  
}

module.exports = createService