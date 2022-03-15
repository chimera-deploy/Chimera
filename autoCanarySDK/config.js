const clientConfiguration = {
  "region": "us-east-2",
  "meshName": "chimera",
  "newVersionNumber": "2",
  "domain": "chimera.local",
  "serviceName": "movieselector",
  "containerPort": "8080",
  "containerProtocol": "http",
  "containerName": "app",
  "backends": [
    "sixtiesmovieserver.chimera.local:8080",
    "seventiesmovieserver.chimera.local:8080"
  ],
  "imageURL": '427813416040.dkr.ecr.us-east-2.amazonaws.com/movieselector:2.0',
  "numInstances": "1",
  "securityGroups": [
    "sg-03c6b2529647457e6"
  ],
  "clusterName": "chimera",
  "subnets": [
    "subnet-0f20233164be30d93",
    "subnet-0620eb34e4f49abb0",
  ],
  "serviceRegistryARN": "arn:aws:servicediscovery:us-east-2:427813416040:service/srv-2rdzmargnx3376ok",
};

module.exports = clientConfiguration;