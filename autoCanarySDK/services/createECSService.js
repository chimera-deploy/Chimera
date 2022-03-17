const { ECSClient, CreateServiceCommand } = require("@aws-sdk/client-ecs")
const { getECSServiceInfo } = require('../pullInfo/getECSService');

const createECSService = async (clusterName, originalECSServiceName, newECSServiceName, taskName) => {
  const client = new ECSClient();
  
  const serviceInfo = await getECSServiceInfo(clusterName, originalECSServiceName);

  serviceInfo.cluster = clusterName;
  serviceInfo.serviceName = newECSServiceName;
  serviceInfo.taskDefinition = taskName;

  const command = new CreateServiceCommand(serviceInfo)
  try {
    const response = await client.send(command)
    console.log(`Success creating new Service named ${newECSServiceName}`)
    return response
  } catch(err){
    console.log(`ERROR creating new Service named ${newECSServiceName}`)
    console.log(err)
    return err
  }  
}

module.exports = createECSService;