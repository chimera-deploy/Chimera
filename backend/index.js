const Chimera = require("./chimera");
const AppMesh = require("./services/AppMesh");
const ECSService = require("./services/ECSService");
const TaskDefinition = require("./services/TaskDefinition");
const { getIDFromArn } = require("./utils/utils");

const { eventsRouter, clientList } = require('./controllers/events');
const deployRouter = require('./controllers/deploy');

Chimera.registerClientList(clientList);

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

app.use('/events', eventsRouter);
app.use('/deploy', deployRouter);

app.post('/setup', async (request, response) => {
  // validate request
  const config = request.body;
  try {
    const result = await Chimera.setup(config);
    response.status(200).send();
  } catch(err) {
    response.status(500).json({error: 'setup failed'});
  }
});

app.post('/mesh-details', async (request, response) => {
  try {
    const meshName = request.body.meshName;
    const clientRegion =  { region: request.body.region };
    let nodes, routers, routes;

    const nodesPromise = new Promise(async (resolve, reject) => {
      try {
        nodes = await AppMesh.nodeNames(meshName, clientRegion);
        resolve()
      } catch (e) {
        reject(e)
      }
    });
    const routersPromise = new Promise(async (resolve, reject) => {
      try {
        routers = await AppMesh.routerNames(meshName, clientRegion);
        resolve()
      } catch (e) {
        reject(e)
      }
    });
    const routesPromise = new Promise(async (resolve, reject) => {
      try {
        routes = await AppMesh.routesByRouter(meshName, clientRegion);
        resolve()
      } catch (e) {
        reject(e)
      }
    });
    const promises = [nodesPromise, routersPromise, routesPromise];

    await Promise.all(promises);
    response.status(200).json({ nodes, routers, routes });
  } catch (error) {
    console.log("Error getting mesh details", error);
    response.status(500).json({ error });
  }
});

app.post('/ecs-details', async (request, response) => {
  const { originalECSServiceName, clusterName } = request.body;
  const clientRegion = { region: request.body.region };

  try {
    const service = await ECSService.describe(clusterName, originalECSServiceName, clientRegion);
    const serviceRegistryIds = service.serviceRegistries.map(registry => getIDFromArn(registry.registryArn));
    const taskDefinitionWithRevision = getIDFromArn(service.taskDefinition);
    const taskDefinition = await TaskDefinition.describe(taskDefinitionWithRevision, clientRegion);
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

app.post('/cw-metric-namespace', async (request, response) => {
  try {
    const { clusterName } = request.body;
    const clientRegion = { region: request.body.region };

    const service = await ECSService.describe(clusterName, `${clusterName}-cw-agent`, clientRegion);
    const taskDefinitionWithRevision = service.taskDefinition;
    const taskDefinition = await TaskDefinition.describe(taskDefinitionWithRevision, clientRegion);
    const env = taskDefinition.containerDefinitions[0].environment.find(env => {
      return env.name === 'CW_CONFIG_CONTENT';
    });
    const parsedEnv = JSON.parse(env.value);
    response.status(200).json({
      metricNamespace: parsedEnv.logs.metrics_collected.prometheus.emf_processor.metric_namespace,
    });
  } catch (err) {
    console.log(err);
    response.status(404).json(
      { error: `unable to fetch metric namespace for cw agent on cluster ${request.body.clusterName}`}
    );
  }
});

app.post('/ecs-services', async (request, response) => {
  const clusterName = request.body.clusterName;
  const clientRegion = { region: request.body.region };

  try {
    const services = await ECSService.listServices(clusterName, clientRegion);
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