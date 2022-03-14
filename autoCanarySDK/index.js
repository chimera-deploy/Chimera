const { AppMeshClient, CreateVirtualNodeCommand, AwsCloudMapInstanceAttribute, ServiceDiscovery } = require("@aws-sdk/client-app-mesh")
const createServiceName = require('./services/createServiceName')
const createVirtualNode = require('./services/createVirtualNode')
const createService = require('./services/createService')
const registerTaskDefinition = require('./services/registerTaskDefinition')
const updateRoute = require('./services/updateRoute')
const testCanary = require('./services/testCanary')
const deleteVirtualNode = require('./services/deleteVirtualNode')
const updateService = require('./services/updateService')
const deleteService = require('./services/deleteService')
const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')

// required parameters
// const clientConfiguration = { region: "us-west-2" }
// const newServiceName = 'serviceAv4'
// const serviceDiscoveryName = 'servicea'
const newServiceNamespaceID = 'ns-duw5hzhk5cfw45c5'
// const clusterName = 'app'
// const clusterARN = 'arn:aws:ecs:us-west-2:822180497458:cluster/app'
// const meshName = 'apps'
// const routeName = 'servicea'
// const originalNodeName = 'serviceAv3'
// const originalServiceName = 'serviceav3'
// const originalNodeWeight = 0
// const canaryNodeName = 'serviceAv4'
// const canaryNodeWeight = 100
// const routePathPrefix = '/'
// const routerName = 'servicea'
// const securityGroups = ['sg-cff186c7']
// const subnets = ['subnet-7273ec0a']

// const taskName = 'APPS-serviceAv4'
// const containerName = 'serviceAv4'
// const imageURL = '822180497458.dkr.ecr.us-west-2.amazonaws.com/serviceav4:latest'
// const containerPortNumber = 8080
// const executionIAMRole = 'arn:aws:iam::822180497458:role/DEMO-ecs-cluster-TaskExecutionIamRole-LT6CS9UJ5IOX' 
// const taskIAMRole = 'arn:aws:iam::822180497458:role/DEMO-ecs-cluster-TaskIamRole-5932OTKY837Z'
// const registryArn = 'arn:aws:servicediscovery:us-west-2:822180497458:service/srv-mesgbyykdafdewbm' // may need to retrieve from response of creating service name in cloud map or by using id with getService.js

const numberOfTests = 5
const testURL = 'http://35.86.102.245:8000/gettime/ab'
const tests = {
  matchDataStrings: ['serviceAv3 response data and serviceB response data', 'serviceAv2 response data and serviceB response data'],
  matchStatus: 200,
}

// const desiredCount = 0


// DO NOT USE!! createServiceName(clientConfiguration, newServiceName, newServiceNamespaceID) // DONT DO!! USE EXISTING SERVICENAME

// Step 1: Create a New Virtual Node
const clientConfiguration = { region: "us-west-2" }
const newServiceName = 'serviceAv4'
const serviceDiscoveryName = 'servicea'
// createVirtualNode(clientConfiguration, meshName, newServiceName, serviceDiscoveryName)


// Step 2: Register Task Definition
const taskName = 'APPS-serviceAv4'
const containerName = 'serviceAv4'
const imageURL = '822180497458.dkr.ecr.us-west-2.amazonaws.com/serviceav4:latest'
const containerPortNumber = 8080
const executionIAMRole = 'arn:aws:iam::822180497458:role/DEMO-ecs-cluster-TaskExecutionIamRole-LT6CS9UJ5IOX' 
const taskIAMRole = 'arn:aws:iam::822180497458:role/DEMO-ecs-cluster-TaskIamRole-5932OTKY837Z'
// registerTaskDefinition(clientConfiguration, taskName, containerName, imageURL, containerPortNumber, executionIAMRole, taskIAMRole)

// Step 3: Create a new Service in ECS
const clusterName = 'app'
const securityGroups = ['sg-cff186c7']
const subnets = ['subnet-7273ec0a']
const registryArn = 'arn:aws:servicediscovery:us-west-2:822180497458:service/srv-mesgbyykdafdewbm' // may need to retrieve from response of creating service name in cloud map or by using id with getService.js
// createService(clientConfiguration, clusterName, securityGroups, subnets, newServiceName, taskName, containerName, registryArn)

// Step 4: Update Route to Shift Traffic to Canary
const meshName = 'apps'
const routeName = 'servicea'
const originalNodeName = 'serviceAv3'
const originalNodeWeight = 0
const canaryNodeName = 'serviceAv4'
const canaryNodeWeight = 100
const routePathPrefix = '/'
const routerName = 'servicea'
// const originalServiceName = 'serviceav3' // No longer needed as should be the existing service discovery name
// updateRoute(clientConfiguration, meshName, routeName, originalNodeName, originalNodeWeight, canaryNodeName, canaryNodeWeight, routePathPrefix, routerName )

// Step 5: Test the health of the Canary
// testCanary(numberOfTests, testURL, tests)

// Step 6: Update the Route to remove the reference to the Virtual of Node of the old version of the App
const removeOldNode = true
//updateRoute(clientConfiguration, meshName, routeName, originalNodeName, originalNodeWeight, canaryNodeName, canaryNodeWeight, routePathPrefix, routerName, removeOldNode )

// Step 7: Delete Virtual Node of the original app
// deleteVirtualNode(clientConfiguration, meshName, originalNodeName)

// Step 8: Update Service to set number of tasks running to 0
// Have to update service to set number of tasks running to 0 before the ECS service can be deleted
const desiredCount = 0
const originalServiceName = 'serviceav3' 
// updateService(clientConfiguration, clusterName, desiredCount, originalServiceName) // may require check to confirm tasks have stopped before proceeding to deletion

// Step 9: Delete the original Service on ECS
const clusterARN = 'arn:aws:ecs:us-west-2:822180497458:cluster/app'
//deleteService(clientConfiguration, clusterARN, originalServiceName)

// Step 10: Deregister the original Task Definition in ECS
const taskDefinitionWithRevision = 'APP-serviceAv3:1'
// deregisterTaskDefinition({ region: 'us-west-2'}, taskDefinitionWithRevision)