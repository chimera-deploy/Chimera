const { AppMeshClient, UpdateRouteCommand } = require("@aws-sdk/client-app-mesh")

const updateRoute = async (clientConfig, meshName, routeName, originalNodeName, originalNodeWeight, canaryNodeName, canaryNodeWeight, pathPrefix, routerName, removeOldNode = false ) => {
  const client = new AppMeshClient(clientConfig)

  const dualTargetInput = {
    meshName: meshName,
    routeName: routeName,
    spec: {
      httpRoute: {
        action: {
          weightedTargets: [
            {
              virtualNode: originalNodeName,
              weight: originalNodeWeight,
            },
            {
              virtualNode: canaryNodeName,
              weight: canaryNodeWeight
            }
          ]
        },
        match: {
          prefix: pathPrefix,
        }
      }
    },
    virtualRouterName: routerName,
  }

  const singleTargetInput = {
    meshName: meshName,
    routeName: routeName,
    spec: {
      httpRoute: {
        action: {
          weightedTargets: [
            {
              virtualNode: canaryNodeName,
              weight: canaryNodeWeight
            }
          ]
        },
        match: {
          prefix: pathPrefix,
        }
      }
    },
    virtualRouterName: routerName,
  }
  
  const updateRouteCommandInput = removeOldNode ? singleTargetInput : dualTargetInput
  
  const command = new UpdateRouteCommand(updateRouteCommandInput)

  try {
    const response = await client.send(command)
    console.log(`Success updating mesh Route named ${routeName}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR updating mesh Route named ${routeName}`)
    console.log(err)
    return err
  }  
}

module.exports = updateRoute