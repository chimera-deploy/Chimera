const { AppMeshClient, UpdateRouteCommand } = require("@aws-sdk/client-app-mesh");
const { getRoutes } = require('../pullInfo/virtualRoutes');

const updateRoute = async (meshName, routeName, routerName, pathPrefix, weightedTargets) => {
  const client = new AppMeshClient();

  const routes = await getRoutes(meshName, routerName);
  const routeToUpdate = routes.find(route => route.routeName === routeName);

  routeToUpdate.spec.httpRoute.action.weightedTargets = weightedTargets;
  routeToUpdate.spec.httpRoute.match.prefix = pathPrefix;

  const command = new UpdateRouteCommand(routeToUpdate);

  await client.send(command);
};

module.exports = updateRoute;