const morgan = require('morgan');
const logger = require('./logger');

morgan.token('postData', function (req) {return JSON.stringify(req.body);});
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :postData');

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  // handle various error conditions here

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

module.exports = {
  requestLogger,
  errorHandler,
  unknownEndpoint,
};