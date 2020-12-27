const got = require('got');

const instance = got.extend({
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = instance;
