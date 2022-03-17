const { AppMeshClient, ListRoutesCommand, DescribeRouteCommand } = require("@aws-sdk/client-app-mesh"); // CommonJS import

const getRoutes = async (meshName, virtualRouterName) => {
  const input = {
    meshName,
    virtualRouterName,
  };
  let response;
  try {
    const client = new AppMeshClient();
    const command = new ListRoutesCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response.routes;
};

const getRoute = async (meshName, virtualRouterName, routeName) => {
  const input = {
    meshName,
    virtualRouterName,
    routeName,
  };
  try {
    const client = new AppMeshClient();
    const command = new DescribeRouteCommand(input);
    response = await client.send(command);
    return response.route;
  } catch (err) {
    console.log('received error:', err);
    return err
  }
};

module.exports = {
  getRoutes,
  getRoute,
};