const config = {
  env: {
    isProduction: process.env.NODE_ENV === 'production',
    port: process.env.APP_PORT || 9090
  },
  jumpSeller: {
    apiLogin: process.env.API_LOGIN || '1cdce6af70be8f7223c8b3717d12d69a',
    authToken: process.env.API_AUTH_TOKEN || '08aa76104eb1a7eb8d8d6670e42cfdf4'
  },
  logger: {
    logLevel: process.env.PINO_LOG_LEVEL || 'debug'
  }
};

module.exports = config;
