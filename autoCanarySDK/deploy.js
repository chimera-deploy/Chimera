const { AppMeshClient, CreateVirtualNodeCommand, AwsCloudMapInstanceAttribute, ServiceDiscovery } = require("@aws-sdk/client-app-mesh");
const createVirtualNode = require('./services/createVirtualNode');
const createService = require('./services/createService');
const registerTaskDefinition = require('./services/registerTaskDefinition');
const updateRoute = require('./services/updateRoute');
// const testCanary = require('./services/testCanary')
const deleteVirtualNode = require('./services/deleteVirtualNode')
const updateECSService = require('./services/updateService')
const deleteECSService = require('./services/deleteService')
const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')
const getCloudMapHealth = require('./services/getCloudMapHealthStatus');
const chimeraConfig = require('./config');
const axios = require('axios');

const tearDown = async (virtualNodeName, ecsServiceName, originalTaskDefinition) => {
  console.log(`deleting virtual node ${virtualNodeName}`);
  await deleteVirtualNode(chimeraConfig, virtualNodeName);
  console.log(`setting desired count for service ${ecsServiceName} to 0`);
  await updateECSService(chimeraConfig, 0, ecsServiceName);
  console.log(`deleting ECS service ${ecsServiceName}`);
  await deleteECSService(chimeraConfig, ecsServiceName);
  console.log(`deregistering task definition ${originalTaskDefinition}`);
  await deregisterTaskDefinition(originalTaskDefinition);
};

const runChimera = async (chimeraConfig, taskName, virtualNodeName) => {
  const originalInstances = await getCloudMapHealth(chimeraConfig.serviceDiscoveryID);
  console.log(`creating virtual node with name ${virtualNodeName}`);
  await createVirtualNode(chimeraConfig, virtualNodeName, taskName);
  console.log(`creating task definition ${taskName}`);
  await registerTaskDefinition(chimeraConfig, taskName, virtualNodeName);
  console.log(`creating service ${virtualNodeName}`);
  await createService(chimeraConfig, taskName, virtualNodeName);
  let weightedTargets = [
    {
      virtualNode: chimeraConfig.originalNodeName,
      weight: 0,
    },
    {
      virtualNode: virtualNodeName,
      weight: 1,
    }
  ];
  console.log(`rerouting traffic to ${virtualNodeName}`);
  await updateRoute(chimeraConfig, weightedTargets);
  console.log('waiting for healthy cloudmap status');
  let intervalId;
  intervalId = setInterval(async () => {
    const updatedInstanceHealth = await getCloudMapHealth(chimeraConfig.serviceDiscoveryID);
    const allHealthy = Object.values(updatedInstanceHealth).every(status => status === 'HEALTHY');
    if (Object.values(updatedInstanceHealth).length !== Object.values(originalInstances).length && allHealthy) {
      clearInterval(intervalId);
      try {
        const response = await axios.get('http://chime-publi-whvq0fouz8xn-911513e641aca00e.elb.us-east-2.amazonaws.com/api');
        if (response.data.version !== Number(chimeraConfig.newVersionNumber)) {
          console.log('traffic shifting failed');
        } else {
          console.log('traffic shifting succeeded');
        }
      } catch (err) {
        console.log('Failed to contact new service version');
      }
      weightedTargets = [
        {
          virtualNode: virtualNodeName,
          weight: 1,
        },
      ];
      console.log(`removing old target ${chimeraConfig.originalNodeName} from route`);
      await updateRoute(chimeraConfig, weightedTargets);
      await tearDown(chimeraConfig.originalNodeName, chimeraConfig.originalECSServiceName, chimeraConfig.originalTaskDefinition);
    }
  }, 10 * 1000);
};

const virtualNodeName = `${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`
const taskName = `${chimeraConfig.meshName}-${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`;

runChimera(chimeraConfig, taskName, virtualNodeName);