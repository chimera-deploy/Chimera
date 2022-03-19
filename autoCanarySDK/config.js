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
  "originalTaskDefinition": "chimera-movieselector-1:6",
  "envoyContainerName": "envoy",
  "originalGatewayTaskDefinition": "chimera-gateway-resources-MovieAppGatewayTaskDef-7hnj9HruLPgW:1",
  "virtualGatewayName": "gateway",
  "region": "us-east-1",
  "awsAccountID": "339936612855",
  "originalGatewayECSServiceName": "chimera-gateway-resources-MovieAppGatewayService-vGeA5R1BJXUY",
  "logGroup": "chimera-log-group",
  "metricNamespace": "chimera-prometheus-metrics",
  "cwECSSecurityGroups": ["sg-0e68e4bc62e146bfb"],
  "cwECSPrimarySubnets": ["subnet-089e14b08ac5c0428", "subnet-0ddb6020c35f084d7"]
};

module.exports = clientConfiguration;
