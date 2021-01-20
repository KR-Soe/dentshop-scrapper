const config = {
  env: {
    isProduction: process.env.NODE_ENV === 'production'
  },
  jumpSeller: {
    apiLogin: process.env.API_LOGIN || 'e68f54a916739efe0aa255efedb3640e',
    authToken: process.env.API_AUTH_TOKEN || 'd5a3017886e8158052893249b296de61'
  },
  logger: {
    logLevel: process.env.PINO_LOG_LEVEL || 'debug'
  }
};

module.exports = config;
