const eventsRouter = (chimera) => {
  const router = require('express').Router();

  router.get('/', (request, response) => {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    };

    response.writeHead(200, headers);
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      response,
    };

    request.on('close', () => {
      logger.info(`${clientId} Connection closed`);
      chimera.clientList = chimera.clientList.filter(client => {
        return client.id !== clientId;
      });
    });
    
    chimera.registerClient(newClient);
  });
  return router;
};

module.exports = eventsRouter;