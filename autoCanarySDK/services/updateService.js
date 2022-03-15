const { ECSClient, UpdateServiceCommand } = require("@aws-sdk/client-ecs");

const updateECSService = async (chimeraConfig, desiredCount, ecsServiceName) => {
  const client = new ECSClient();
  const updateServiceCommandInput = {
    cluster: chimeraConfig.clusterName,
    desiredCount,
    service: ecsServiceName,
  };
  const command = new UpdateServiceCommand(updateServiceCommandInput);
  
  try {
    const response = await client.send(command)
    console.log(`Success updating service named ${ecsServiceName}`);
    return response;
  } catch(err) {
    console.log(`ERROR updating service named ${ecsServiceName}`);
    console.log(err);
    return err;
  }
}

module.exports = updateECSService;