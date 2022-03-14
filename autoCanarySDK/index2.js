const { AppMeshClient, CreateVirtualNodeCommand, AwsCloudMapInstanceAttribute, ServiceDiscovery } = require("@aws-sdk/client-app-mesh")
// const createServiceName = require('./services/createServiceName')
const createVirtualNode = require('./services/createVirtualNode')
// const createService = require('./services/createService')
const registerTaskDefinition = require('./services/registerTaskDefinition')
// const updateRoute = require('./services/updateRoute')
// const testCanary = require('./services/testCanary')
// const deleteVirtualNode = require('./services/deleteVirtualNode')
// const updateService = require('./services/updateService')
// const deleteService = require('./services/deleteService')
// const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')

const chimeraConfig = require('./config');

createVirtualNode(chimeraConfig);
// registerTaskDefinition(chimeraConfig);
