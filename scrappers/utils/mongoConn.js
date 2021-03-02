const { MongoClient } = require('mongodb');

const makeDBInstance = async (host = 'localhost', port = 27017) => {
  const dbURL = `mongodb://${host}:${port}`;
  const instance = await MongoClient.connect(dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  return instance;
};

module.exports = makeDBInstance;
