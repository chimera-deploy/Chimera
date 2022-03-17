const { ECSClient, DescribeServicesCommand } = require("@aws-sdk/client-ecs");
const config = require('../config');

const getECSServiceInfo = async (clusterName, originalECSServiceName) => {
  const client = new ECSClient();

  const describeServicesInput = {
    cluster: clusterName, // could also use clusterARN
    services: [ originalECSServiceName ],
  };

  const command = new DescribeServicesCommand(describeServicesInput);
  const response = await client.send(command);
  return response;
};

getECSServiceInfo(config.clusterName, config.originalECSServiceName).then(response => {
  console.log(response);
});