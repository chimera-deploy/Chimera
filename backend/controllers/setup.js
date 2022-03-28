const logger = require('../utils/logger');

const eventsRouter = (chimera) => {
  const router = require('express').Router();
  router.post('/setup', async (request, response) => {
    const config = request.body;
    try {
      const result = await chimera.setup(config);
      response.status(200).send();
    } catch(err) {
      response.status(500).json({error: 'setup failed'});
    }
  });
  return router;
};

module.exports = eventsRouter;