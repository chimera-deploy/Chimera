const clientConfiguration = {
  "meshName": "chimera",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",

  "originalNodeName": "movieselector-15",
  "originalECSServiceName": "movieselector-15",
  "originalTaskDefinition": "chimera-movieselector-15:1",

  "newNodeName": "movieselector-18",
  "newECSServiceName": "movieselector-18",
  "newTaskDefinitionName": "chimera-movieselector-18",

  "clusterName": "chimera",
  "containerName": "app",
  "imageURL": '339936612855.dkr.ecr.us-east-1.amazonaws.com/movieselector:1.0',
  "envoyContainerName": "envoy",
  "serviceDiscoveryID": "srv-og6bcp4odezgw4k3",

  "routeUpdateInterval": "2",
  "shiftWeight": "25",
  "maxFailures": "0",

  "region": "us-east-1",
  "awsAccountID": "339936612855",
  "metricNamespace": "chimera-prometheus-metrics-18",
  "vpcID": "vpc-009982664fe05da7f",
  "cwECSPrimarySubnets": ["subnet-0b762c591b8eef19e", "subnet-03f885dfbdfacaf31"],
};

module.exports = clientConfiguration;
