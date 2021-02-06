const pino = require('pino');
const config = require('../config');

const logger = pino({ level: config.logger.logLevel });

module.exports = logger;
