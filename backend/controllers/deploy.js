const deployRouter = require('express').Router();

deployRouter.post('/', (request, response) => {
  const config = request.body;
  console.log(config);
  Chimera.deploy(config);
  response.status(200).send();
});

module.exports = deployRouter;