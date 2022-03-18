const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "1",
  "serviceName": "movieselector",
  "containerName": "app",
  "imageURL": '427813416040.dkr.ecr.us-east-2.amazonaws.com/movieselector:1.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-2rdzmargnx3376ok",
  "originalNodeName": "movieselector-3",
  "originalECSServiceName": "movieselector-3",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",
  "originalTaskDefinition": "chimera-movieselector-3:30",
  "envoyContainerName": "envoy",
};

module.exports = clientConfiguration;