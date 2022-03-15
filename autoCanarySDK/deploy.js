const { AppMeshClient, CreateVirtualNodeCommand, AwsCloudMapInstanceAttribute, ServiceDiscovery } = require("@aws-sdk/client-app-mesh");
const createVirtualNode = require('./services/createVirtualNode');
const createService = require('./services/createService');
const registerTaskDefinition = require('./services/registerTaskDefinition');
const updateRoute = require('./services/updateRoute');
// const testCanary = require('./services/testCanary')
// const deleteVirtualNode = require('./services/deleteVirtualNode')
// const updateService = require('./services/updateService')
// const deleteService = require('./services/deleteService')
// const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')

const chimeraConfig = require('./config');

const virtualNodeName = `${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`
const taskName = `${chimeraConfig.meshName}-${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`;

// const virtualNode = createVirtualNode(chimeraConfig, virtualNodeName, taskName);
// const taskDef = registerTaskDefinition(chimeraConfig, taskName, virtualNodeName);
// const service = createService(chimeraConfig, taskName, virtualNodeName);
const weightedTargets = [
  {
    virtualNode: chimeraConfig.originalNodeName,
    weight: 50,
  },
  {
    virtualNode: virtualNodeName,
    weight: 50,
  }
];
updateRoute(chimeraConfig, weightedTargets,);
