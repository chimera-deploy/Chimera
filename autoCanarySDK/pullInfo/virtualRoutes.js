const { AppMeshClient, ListRoutesCommand } = require("@aws-sdk/client-app-mesh"); // CommonJS import

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

module.exports = {
  getRoutes,
};