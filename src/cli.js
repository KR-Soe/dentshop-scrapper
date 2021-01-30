const syncService = require('./services/sync');
const mailService = require('./services/mailer');
const config = require('./config');
const pino = require('pino');
const logger = pino({ level: config.logger.logLevel });

async function main() {
  const socket = {
    emit: () => null
  };

  await syncService(logger, socket, mailService);
}

main(process.argv);
