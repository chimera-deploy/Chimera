const logger = require('../utils/logger');

const deployRouter = (chimera) => {
  const router = require('express').Router();
  router.post('/', (request, response) => {
    if (!chimera) {
      response.status(500).json({ error: 'chimera not initialized' });
    } else {
      const config = request.body;
      logger.info(config);
      chimera.deploy(config);
      response.status(200).send();
    }
  });
  return router;
};

module.exports = deployRouter;