const clientConfiguration = {
  "meshName": "chimera",
  "newVersionNumber": "3",
  "serviceName": "movieselector",
  "containerName": "app",
  "imageURL": '427813416040.dkr.ecr.us-east-2.amazonaws.com/movieselector:3.0',
  "clusterName": "chimera",
  "serviceDiscoveryID": "srv-2rdzmargnx3376ok",
  "originalNodeName": "movieselector-2",
  "originalECSServiceName": "movieselector-2",
  "routeName": "movieselector-route",
  "routerName": "movieselector-vr",
  "originalTaskDefinition": "chimera-movieselector-2:23",
  "envoyContainerName": "envoy",
};

module.exports = clientConfiguration;