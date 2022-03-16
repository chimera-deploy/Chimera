const deleteVirtualNode = require('./services/deleteVirtualNode')
const updateECSService = require('./services/updateECSService')
const deleteECSService = require('./services/deleteECSService')
const deregisterTaskDefinition = require('./services/deregisterTaskDefinition')
const chimeraConfig = require('./config');
const Chimera = require('./chimera');
const MOVIE_SELECTOR_URI = 'http://chime-publi-whvq0fouz8xn-911513e641aca00e.elb.us-east-2.amazonaws.com/api';

Chimera.deploy(chimeraConfig);
// await tearDown(chimeraConfig.originalNodeName, chimeraConfig.originalECSServiceName, chimeraConfig.originalTaskDefinition);
