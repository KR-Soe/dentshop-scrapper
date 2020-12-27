const request = require('./request');
const config = require('../config');

const { apiLogin, authToken } = config.jumpSeller;
const url = `https://api.jumpseller.com/v1/products.json?login=${apiLogin}&authtoken=${authToken}`;

console.log('url', url);

const service = {
  async findAllProducts() {
    const response = await request.get(url).json();
    return response;
  },
  async updateProduct(product) {

  },
  async addProduct(product) {
    const options = { json: { product } };
    const response = await request.post(url, options).json();
    return response;
  }
};


module.exports = service;
