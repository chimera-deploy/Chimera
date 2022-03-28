const Chimera = require("./chimera");
const eventsRouter = require('./controllers/events')
const deployRouter = require('./controllers/deploy');
const setupRouter = require('./controllers/setup');
const awsInfoRouter = require('./controllers/awsInfo');
const middleware = require('./utils/middleware');

const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  app.use(middleware.requestLogger);
}

app.use('/events', eventsRouter(Chimera));
app.use('/deploy', deployRouter(Chimera));
app.use('/setup', setupRouter(Chimera));
app.use('/awsinfo', awsInfoRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;