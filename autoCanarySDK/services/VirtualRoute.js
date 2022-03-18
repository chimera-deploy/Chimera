const { AppMeshClient, UpdateRouteCommand, DescribeRouteCommand } = require("@aws-sdk/client-app-mesh");

const describe = async (meshName, virtualRouterName, routeName) => {
  const input = {
    meshName,
    virtualRouterName,
    routeName,
  };

  const client = new AppMeshClient();
  const command = new DescribeRouteCommand(input);
  response = await client.send(command);
  return response.route;
};

const update = async (meshName, routeName, routerName, weightedTargets) => {
  const client = new AppMeshClient();

  const route = await describe(meshName, routerName, routeName);
  route.spec.httpRoute.action.weightedTargets = weightedTargets;
  const command = new UpdateRouteCommand(route);
  await client.send(command);
};

module.exports = {
  update,
  describe,
};