const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "2",
  "serviceName": "seventiesserver",
  "containerName": "app",
  "imageURL": '339936612855.dkr.ecr.us-east-1.amazonaws.com/seventiesserver:2.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-23kewfoc464yrznd",
  "originalNodeName": "seventiesserver-1",
  "originalECSServiceName": "seventiesserver-1",
  "routeName": "seventies-route",
  "routerName": "seventiesmovieserver-vr",
  "originalTaskDefinition": "chimera-seventiesserver-1:5",
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
