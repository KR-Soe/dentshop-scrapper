const config = {
  env: {
    isProduction: process.env.NODE_ENV === 'production'
  },
  jumpSeller: {
    apiLogin: process.env.API_LOGIN || 'e68f54a916739efe0aa255efedb3640e',
    authToken: process.env.API_AUTH_TOKEN || 'd5a3017886e8158052893249b296de61'
  },
  logger: {
    logLevel: 'debug'
  }
};

if (config.env.isProduction) {
  config.jumpSeller.apiLogin = '18e471655ecb112469964198b07e676e';
  config.jumpSeller.authToken = '09d1ef21ed1a6660b314f65f70beb412';
  config.logger.logLevel = 'info';
}

module.exports = config;
