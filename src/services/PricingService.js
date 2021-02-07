class PricingService {
  constructor(revenue) {
    this._revenue = Number.parseFloat(revenue);
  }

  setRevenue(revenue) {
    this._revenue = Number.parseFloat(revenue);
  }

  calculatePriceWithRevenue(originalPrice) {
    return this.roundPrice(Number.parseFloat(originalPrice) * this._revenue);
  }

  roundPrice(price) {
    const basePrice = Math.trunc(price / 1000);
    const initialDelta = price % 1000;

    const delta = [0, 500, 900].reduce((acc, rest) => {
      if (Math.abs(rest - initialDelta) <= acc.delta) {
        acc.newPrice = rest;
        acc.delta = Math.abs(rest - acc.delta);
      }

      return acc;
    }, { newPrice: null, delta: initialDelta });

    return (basePrice) * 1000 + delta.newPrice;
  }
}

module.exports = PricingService;
