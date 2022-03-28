const clientConfiguration = {
  "meshName": "MyMesh",
  "routeName": "randomNumber",
  "routerName": "randomNumber",

  "originalNodeName": "randomNumber-2",
  "originalECSServiceName": "randomNumber-2",
  "originalTaskDefinition": "randomNumber-2:1",

  "newNodeName": "randomNumber-1",
  "newECSServiceName": "randomNumber-1",
  "newTaskDefinitionName": "randomNumber-1",

  "clusterName": "randomNumber",
  "containerName": "randomNumber",
  "imageURL": "522968852253.dkr.ecr.us-east-2.amazonaws.com/random-number:1",
  "envoyContainerName": "envoy",
  "serviceDiscoveryID": "srv-pnwwbagytaqial7v",

  "routeUpdateInterval": "1",
  "shiftWeight": "25",
  "maxFailures": "0",

  "region": "us-east-2",
  "awsAccountID": "339936612855",
  "metricNamespace": "chimera-prometheus-metrics-18",
  "vpcID": "vpc-009982664fe05da7f",
  "cwECSPrimarySubnets": ["subnet-0b762c591b8eef19e", "subnet-03f885dfbdfacaf31"],
};

module.exports = clientConfiguration;
