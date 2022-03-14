# dragon - a simple AWS App Mesh spike
serviceB service public ip: http://35.86.140.102:8080/
serviceB port: 8080

virtualGateway public ip: http://35.86.102.245:8000/
virtualGateway port: 8000
serviceA path: /servicea
serviceB path: /serviceb, /
getTime ab path: /gettime/ab
getTime test path: /gettime/test

# SETUP A SIMPLE AWS APP MESH ###
1. Use Docker to create images of your apps
  - each app/service should be its own image
2. Push your docker containers to ECR
  - create a new ECR repository for every image (app/service)
  - tag each image with its respective ECR repo details (see 'push commands' in ECR)
  - push each ECR tagged image to its respective ECR repo (see 'push commands' in ECR)
3. Create new task definitions for each image (app/service)
  - each task definition will define:
    - the app/service container to spin up based off an image in ECR
    - It will eventually contain an 'envoy' proxy that will be added once the app mesh is enabled
4. Create and define your AWS App Mesh



VirtualGateway --dependentOn--> Mesh
VirtualService --dependentOn-->> VirtualRouter
VirtualNode --dependentOn--> Service (specifically Hostname i.e servicea.apps.local)
Service --dependentOn--> TaskDefinition
TaaskDefinition --dependentOn--> Mesh && VirtualNode

