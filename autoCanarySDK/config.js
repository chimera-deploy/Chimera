const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "2",
  "serviceName": "movieselector",
  "containerName": "app",
  "imageURL": '339936612855.dkr.ecr.us-east-1.amazonaws.com/movieselector:2.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-og6bcp4odezgw4k3",
  "originalNodeName": "movieselector-1",
  "originalECSServiceName": "movieselector-1",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",
  "originalTaskDefinition": "chimera-movieselector-1:10",
  "envoyContainerName": "envoy",
  "originalGatewayTaskDefinition": "chimera-gateway-resources-MovieAppGatewayTaskDef-rNz0q5HMTN9g:1",
  "virtualGatewayName": "gateway",
  "region": "us-east-1",
  "awsAccountID": "339936612855",
  "originalGatewayECSServiceName": "chimera-gateway-resources-MovieAppGatewayService-C9qFJKQ4M7br",
  "logGroup": "chimera-log-group",
  "metricNamespace": "chimera-prometheus-metrics-3",
  "cwECSSecurityGroups": ["sg-08a1afa30e5ee1f04"],
  "cwECSPrimarySubnets": ["subnet-0b762c591b8eef19e", "subnet-03f885dfbdfacaf31"]
};

module.exports = clientConfiguration;
