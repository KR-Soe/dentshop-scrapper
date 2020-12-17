const http = require('http');
const app = require('./app');

http.createServer(app).listen(9090, () => {
  console.log('listening on http://localhost:9090');
});
