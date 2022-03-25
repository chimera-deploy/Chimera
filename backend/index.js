const Chimera = require("./autoCanarySDK/chimera");
const ECSService = require("./autoCanarySDK/services/ECSService");
const TaskDefinition = require("./autoCanarySDK/services/TaskDefinition");
const { getIDFromArn } = require("./utils");
const express = require("express");
const app = express();
app.use(express.json());
const PORT = 5000;

app.get('/', (request, response) => {
  response.json({hello: "world"});
});

app.post('/deploy', (request, response) => {
  //validate request
  const config = request.body;
  console.log(config);
  Chimera.deploy(config);
  response.status(200).send();
});

app.get('/ecs-details', async (request, response) => {
  const { originalECSServiceName, clusterName } = request.body;
  try {
    const service = await ECSService.describe(clusterName, originalECSServiceName);
    const serviceRegistryIds = service.serviceRegistries.map(registry => getIDFromArn(registry.registryArn));
    const taskDefinitionWithRevision = getIDFromArn(service.taskDefinition);
    const taskDefinition = await TaskDefinition.describe(taskDefinitionWithRevision);
    const containerNames = taskDefinition.containerDefinitions.map(def => def.name);
    response.status(200).json({
      serviceRegistryIds,
      originalTaskDefinition: taskDefinitionWithRevision,
      containerNames
    });
  } catch (err) {
    console.log(err);
    response.status(404).json(
      { error: `unable to find service with name ${originalECSServiceName} on cluster ${clusterName}`}
    );
  }
});

app.get('/ecs-services', async (request, response) => {
  const clusterName = request.body.clusterName;
  try {
    const services = await ECSService.listServices(clusterName);
    response.status(200).json({
      ECSServiceNames: services,
    });
  } catch (err) {
    response.status(404).json(
      { error: `unable to find cluster named ${clusterName}`}
    );
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));