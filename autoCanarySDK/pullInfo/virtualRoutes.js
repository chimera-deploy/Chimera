const { AppMeshClient, ListRoutesCommand } = require("@aws-sdk/client-app-mesh"); // CommonJS import

const getRoutes = async () => {
  const input = {
    meshName: "chimera",
    virtualRouterName: "movieselector-vr"
  };
  let response;
  try {
    console.log(`requesting list routes`)
    const client = new AppMeshClient();
    const command = new ListRoutesCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response;
};

(async () => {
  const data = await getRoutes();
  console.log(data);
})();
