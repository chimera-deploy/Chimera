const Chimera = require("./autoCanarySDK/chimera");
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

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));