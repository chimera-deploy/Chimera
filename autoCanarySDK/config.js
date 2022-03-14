const clientConfiguration = {
  "region": "us-east-2",
  "meshName": "chimera",
  "newVersionNumber": "3",
  "domain": "chimera.local",
  "serviceName": "movieselector",
  "containerPort": "8080",
  "containerProtocol": "http",
  "containerName": "app",
  "backends": [
    "sixtiesmovieserver.chimera.local",
    "seventiesmovieserver.chimera.local"
  ],
  "imageURL": '427813416040.dkr.ecr.us-east-2.amazonaws.com/movieselector:3.0'
};

module.exports = clientConfiguration;