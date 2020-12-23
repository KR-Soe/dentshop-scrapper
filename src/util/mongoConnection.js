const { MongoClient } = require('mongodb');

async function createConnection(dbName = 'dentshop', host = 'localhost', port = 27017) {
  const url = `mongodb://${host}:${port}`;

  const instance = await MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  return instance.db(dbName);
}

module.exports = createConnection;
