const config = {
  env: {
    isProduction: process.env.NODE_ENV === 'production',
    port: process.env.APP_PORT || 9090
  },
  jumpSeller: {
    apiLogin: process.env.API_LOGIN || '18e471655ecb112469964198b07e676e',
    authToken: process.env.API_AUTH_TOKEN || '09d1ef21ed1a6660b314f65f70beb412'
  },
  logger: {
    logLevel: process.env.PINO_LOG_LEVEL || 'debug'
  },
  mailer: {
    emit: {
      user: process.env.MAIL_OWNER  || 'dospuntodos2021@gmail.com',
      pass: process.env.MAIL_PASSWORD  || 'dospuntodos20212022'
    },
    to: {
      user: process.env.MAIL_USER ||'dentshop@mailinator.com'
    }
  },
  features: {
    syncFilterProducts: (process.env.SYNC_FILTER_PRODUCTS || 'off') === 'on'
  }
};

module.exports = config;
