const service = {
  _revenue: 1.5,
  calculatePriceWithRevenue(originalPrice) {
    return originalPrice * this._revenue;
  }
};

module.exports = service;
