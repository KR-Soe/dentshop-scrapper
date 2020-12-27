const config = {
  jumpSeller: {
    apiLogin: '5b45f977f7c8768a15005adf085df3b1',
    authToken: '4aacf490435b568edac602451a95810d'
  },
  logger: {
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
};


module.exports = config;
