const Chimera = require("./autoCanarySDK/chimera");
const AppMesh = require("./autoCanarySDK/services/AppMesh");
const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;

app.get('/', (request, response) => {
  response.json({hello: "world"});
});

app.post('/deploy', (request, response) => {
  //validate request
  const config = request.body;
  console.log(config);
  Chimera.deploy(config);
  response.status(200).send();
});

app.get('/mesh-details', async (request, response) => {
  try {
    const meshName = request.body.meshName;

    const nodes = await AppMesh.nodeNames(meshName);
    const routers = await AppMesh.routersWithRoutes(meshName);

    response.status(200).json({ nodes, routers });
  } catch (error) {
    console.log("Error getting mesh details", error);
    response.status(500).json({ error });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));