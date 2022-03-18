const { AppMeshClient, UpdateRouteCommand } = require("@aws-sdk/client-app-mesh");
const { getRoute } = require('../pullInfo/virtualRoutes');

const updateRoute = async (meshName, routeName, routerName, weightedTargets) => {
  const client = new AppMeshClient();

  const route = await getRoute(meshName, routerName, routeName);
  route.spec.httpRoute.action.weightedTargets = weightedTargets;
  const command = new UpdateRouteCommand(route);
  await client.send(command);
};

module.exports = updateRoute;