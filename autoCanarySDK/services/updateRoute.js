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

  await client.send(command);
}

module.exports = updateRoute;