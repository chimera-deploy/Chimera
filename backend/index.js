const Chimera = require("./chimera");
const eventsRouter = require('./controllers/events')
const deployRouter = require('./controllers/deploy');
const setupRouter = require('./controllers/setup');
const awsInfoRouter = require('./controllers/awsInfo');

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

app.use('/events', eventsRouter(Chimera));
app.use('/deploy', deployRouter(Chimera));
app.use('/setup', setupRouter(Chimera));
app.use('/awsinfo', awsInfoRouter);

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));