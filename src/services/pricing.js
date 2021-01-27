const service = {
  _revenue: 1.5,
  calculatePriceWithRevenue(originalPrice) {
    const precalculatedRevenue = originalPrice * this._revenue;
    return this._adjustRevenue(precalculatedRevenue);
  },
  _adjustRevenue(initialRevenue) {
    const basePrice = Math.trunc(initialRevenue / 1000);
    const initialDelta = initialRevenue % 1000;

    const delta = [0, 500, 900].reduce((acc, rest) => {
      if (Math.abs(rest - initialDelta) <= acc.delta) {
        acc.newRevenue = rest;
        acc.delta = Math.abs(rest - acc.delta);
      }

      return acc;
    }, { newRevenue: null, delta: initialDelta });

    return (basePrice) * 1000 + delta.newRevenue;
  }
};

module.exports = service;
