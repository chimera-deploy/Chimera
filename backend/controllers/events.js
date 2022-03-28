const eventsRouter = require('express').Router();

const clientList = [];

const registerClient = (client) => {
  clientList.push(client);
};

eventsRouter.get('/', (request, response) => {
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
    console.log(`${clientId} Connection closed`);
  });
  
  registerClient(newClient);
});

module.exports = {
  eventsRouter,
  clientList,
};