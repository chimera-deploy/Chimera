const logger = require('../utils/logger');

const abortRouter = (chimera) => {
  const router = require('express').Router();
  router.post('/', (request, response) => {
    if (!chimera) {
      response.status(500).json({ error: 'chimera not initialized' });
    } else {
      const config = request.body;
      logger.info(config);
      chimera.abort(config);
      response.status(200).json({ data: 'abort request received'});
    }
  });
  return router;
};

module.exports = abortRouter;