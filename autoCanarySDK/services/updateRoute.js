const { AppMeshClient, UpdateRouteCommand } = require("@aws-sdk/client-app-mesh");

const updateRoute = async (chimeraConfig, weightedTargets) => {
  const client = new AppMeshClient();

  const updateRouteCommandInput = {
    meshName: chimeraConfig.meshName,
    routeName: chimeraConfig.routeName,
    spec: {
      httpRoute: {
        action: {
          weightedTargets,
        },
        match: {
          prefix: chimeraConfig.pathPrefix,
        },
      },
    },
    virtualRouterName: chimeraConfig.routerName,
  };

  const command = new UpdateRouteCommand(updateRouteCommandInput);

  try {
    const response = await client.send(command);
    console.log(`Success updating mesh Route named ${chimeraConfig.routeName}`);
    return response;
  } catch(err) {
    console.log(`ERROR updating mesh Route named ${chimeraConfig.routeName}`);
    console.log(err);
    return err;
  }  
}

module.exports = updateRoute;