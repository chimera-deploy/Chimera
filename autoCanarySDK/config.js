const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "2",
  "serviceName": "movieselector",
  "containerName": "app",
  "imageURL": '427813416040.dkr.ecr.us-east-2.amazonaws.com/movieselector:2.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-2rdzmargnx3376ok",
  "originalNodeName": "movieselector-1",
  "originalECSServiceName": "movieselector-1",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",
  "originalTaskDefinition": "chimera-movieselector-1:17",
  "envoyContainerName": "envoy",
};

module.exports = clientConfiguration;