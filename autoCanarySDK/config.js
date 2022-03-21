const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "1",
  "serviceName": "movieselector",
  "containerName": "app",
  "imageURL": '339936612855.dkr.ecr.us-east-1.amazonaws.com/movieselector:3.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-og6bcp4odezgw4k3",
  "originalNodeName": "movieselector-3",
  "originalECSServiceName": "movieselector-3",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",
  "originalTaskDefinition": "chimera-movieselector-3:1",
  "envoyContainerName": "envoy",
  "originalGatewayTaskDefinition": "chimera-gateway-resources-MovieAppGatewayTaskDef-QK8gkRvhNmyx:1",
  "virtualGatewayName": "gateway",
  "region": "us-east-1",
  "awsAccountID": "339936612855",
  "originalGatewayECSServiceName": "chimera-gateway-resources-MovieAppGatewayService-CC0yQ05SXWJi",
  "logGroup": "chimera-log-group",
  "metricNamespace": "chimera-prometheus-metrics-4",
  "cwECSSecurityGroups": ["sg-08a1afa30e5ee1f04"],
  "cwECSPrimarySubnets": ["subnet-0b762c591b8eef19e", "subnet-03f885dfbdfacaf31"]
};

module.exports = clientConfiguration;
