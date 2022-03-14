# Implementing Canary with SDK

# Demo running on 
- Virtual Gateway
  - public IP: http://35.86.102.245:8000/
  - defaults to serviceb
- The getTime app 
  - sends a request to servicea and serviceb and returns a concatenated string
  - http://35.86.102.245:8000/gettime/ab
- servicea: 
  - path /servicea
- serviceb:
  - path /serviceb
  - public IP: http://35.86.140.102:8080/

## Required Packages ##
- @aws-sdk/client-servicediscovery
- @aws-sdk/client-ecs
- @aws-sdk/client-ecr and/or @aws-sdk/client-ecr-public
- @aws-sdk/client-app-mesh

# Parameters Needed
    - client configuration
    - name of AWS App Mesh
    - name of new Service (name of Canary)
    - name of new Task Definition
    - name of new Container for the canary within the Task Definition
    - URI/URL of the docker images stored on ECR
    - port # the canary will listen to in the container
    - a execution IAM Role
    - a task IAM Role
    - name of existing cluster on ECS to create the service in
    - a security group with proper traffic permissions (must allow HTTP traffic)
    - the subnets you wish the service to run on
    - the registry ARN for the original apps service name in service discovery/cloud map (requires service discovery ID)
    - name of the existing App Mesh 
    - routeName (reuse existing service discovery name?)
    - name of original Virtual Node that will need to be replaced
    - weight to apply to the original Virtual Node
    - weight to apply to the canary Virtual Node
    - route path prefix (typically '/')
    - name of the router (reuse existing service discovery name?)
    - removeOldNode (boolean)
    - Desired number of tasks to be running (0)
    - name of the original service on ECS
    - ARN of the cluster the Service is being deleted from
    - The name of the original Task Definition along with its version tag (i.e.' APP-serviceAv3:1' )

# Pre-autoCanarySDK steps
1. create docker image of the canary app
2. upload docker image to AWS ECR

# Steps for using autoCanarySDK
1. Create a new Virtual Node for the canary
  - Parameters Required:
    - client configuration
    - name of AWS App Mesh
    - name of new Service (name of Canary)
    - existing Service Discovery Name of the app to be replaced
  - Use function 'createVirtualNode'
  - SDK: @aws-sdk/client-app-mesh

2. Register Task Definition for the canary
  - Parameters Required:
    - client configuration (previously used)
    - name of new Task Definition
    - name of new Container for the canary within the Task Definition
    - URI/URL of the docker images stored on ECR
    - port # the canary will listen to in the container
    - a execution IAM Role
    - a task IAM Role
  - Use function 'registerTaskDefinition'
  - Notes:
    - The function will setup 2 conatiners:
      - A container for the canary image found via the URI/URL to ECR
      - A container for the Envoy proxy (URL currently hardcoded into function)

3. Create a new Service in ECS
  - Parameters Required:
    - client configuration (previously used)
    - name of new Service (previously used)
    - name of new Task Definition (previously used)
    - name of new Container for the canary within the Task Definition (previously used)
    - name of existing cluster on ECS to create the service in
    - a security group with proper traffic permissions (must allow HTTP traffic)
    - the subnets you wish the service to run on
    - the registry ARN for the original apps service name in service discovery/cloud map (requires service discovery ID)
  - Use function 'createService'
  - Notes:
    - function currently sets VPC to the users default VPC
    - the registry ARN requires the service discovery ID for the original service 
      - can then get full ARN using the ID with 'getService.js' or...
      - create ARN using basic ARN template with user info and service ID

4. Update Route to Shift Traffic to Canary
  - Parameters Required:
    - client configuration (previously used)
    - name of the existing App Mesh 
    - routeName (reuse existing service discovery name?)
    - name of original Virtual Node that will need to be replaced
    - weight to apply to the original Virtual Node
    - name of the canary Virtual Node (previously used - same as newServiceName in Step 1)
    - weight to apply to the canary Virtual Node
    - route path prefix (typically '/')
    - name of the router (reuse existing service discovery name?)
  - Use function 'updateRoute'

5. Test the health of the Canary
  - Only implemented as an example 

6. Update the Route to remove the reference to the Virtual of Node of the old version of the App
  - Parameters Required:
    - removeOldNode (boolean) set to true
    - see Step 4
  - Use function 'updateRoute'
  - Notes:
    - the Virtual Node cannot be deleted until it is no longer referenced in the route/app mesh
    - 'updateRoute' takes an optional parameter that when set to true only sets one weighted target

7. Delete Virtual Node of the original app
  - Parameters Required:
    - client configuration (previously used)
    - name of the existing App Mesh (previously used)
    - name of original Virtual Node (previously used)
  - use function 'deleteVirtualNode'

8. Update ECS Serviceto set number of Tasks running to 0
  - Parameters Required:
    - client configuration (previously used)
    - name of  cluster on ECS (previously used)
    - Desired number of tasks to be running (0)
    - name of the original service on ECS
  - Use function 'updateService'

9. Delete the original Service on ECS
  - Parameters Required:
    - client configuration (previously used)
    - name of the original service on ECS (previously used)
    - ARN of the cluster the Service is being deleted from
      
10. Deregister the Task Definition in ECS
  - Parameters Required:
    - client configuration (previously used)
    - The name of the original Task Definition along with its version tag (i.e.' APP-serviceAv3:1' )
  - Use function 'deregisterTaskDefinition'

