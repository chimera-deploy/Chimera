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

const chimeraConfig = require('./config');

const virtualNodeName = `${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`
const taskName = `${chimeraConfig.meshName}-${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`;

// const virtualNode = createVirtualNode(chimeraConfig, virtualNodeName, taskName);
// const taskDef = registerTaskDefinition(chimeraConfig, taskName, virtualNodeName);
// const service = createService(chimeraConfig, taskName, virtualNodeName);
// const weightedTargets = [
//   {
//     virtualNode: chimeraConfig.originalNodeName,
//     weight: 50,
//   },
//   {
//     virtualNode: virtualNodeName,
//     weight: 50,
//   }
// ];
// updateRoute(chimeraConfig, weightedTargets,);

// runCanary(duration, intervalLength)
// const weightedTargets = [
//   {
//     virtualNode: virtualNodeName,
//     weight: 1,
//   },
// ];

// updateRoute(chimeraConfig, weightedTargets);

const tearDown = async (virtualNodeName, ecsServiceName, originalTaskDefinition) => {
  // deleteVirtualNode(chimeraConfig, virtualNodeName);
  // set tasks running to 0
  // await updateECSService(chimeraConfig, 0, ecsServiceName);
  // // delete service
  // await deleteECSService(chimeraConfig, ecsServiceName);
  // deregister the task definition
  // deregisterTaskDefinition(originalTaskDefinition);
};

tearDown(chimeraConfig.originalNodeName, chimeraConfig.originalServiceName, chimeraConfig.originalTaskDefinition);