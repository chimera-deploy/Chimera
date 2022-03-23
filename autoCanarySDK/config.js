const clientConfiguration = {
  "meshName": "MyMesh",
  "routeName": "randomNumber",
  "routerName": "randomNumber",
  "originalNodeName": "randomNumber-2",
  "originalECSServiceName": "randomNumber-2",
  "originalTaskDefinition": "MyMesh-randomNumber-2:11",

  "newNodeName": "",
  "newECSServiceName": "",
  "newTaskDefinitionName": "",

  "containerName": "randomNumber",
  "imageURI": '522968852253.dkr.ecr.us-east-2.amazonaws.com/random-number:1',
  "clusterName": "randomNumber",
  "serviceDiscoveryID": "srv-pnwwbagytaqial7v",
  "envoyContainerName": "envoy",

  "routeUpdateInterval": "1",
  "shiftWeight": "25",
  "maxFailures": "0",

  "region": "us-east-2",
  "awsAccountID": "522968852253",
  "metricNamespace": "chimera-prometheus-metrics-3",
  "cwECSSecurityGroups": ["sg-05acbb0dbc0737d18"],
  "cwECSPrimarySubnets": ["subnet-0084713a6ca9fff19"],

};

module.exports = clientConfiguration;
