from functools import reduce


class PriceCalculator:
    def __init__(self, connection):
        result = connection.revenue.find_one({})
        self._revenue = result['value']

    def calculate_price_with_revenue(self, original_price):
        return self.round_price(float(original_price) * self._revenue)

    @staticmethod
    def round_price(price):
        base_price = int(price / 1000)
        initial_delta = price % 1000

        def get_delta(acc, rest):
            if abs(rest - initial_delta) <= acc['delta']:
                acc['new_price'] = rest
                acc['delta'] = abs(rest - acc['delta'])

            return acc

        seed = { 'new_price': None, 'delta': initial_delta }
        res = reduce(get_delta, [0, 500, 900], seed)
        return base_price * 1000 + res['new_price']







#     calculatePriceWithRevenue(originalPrice) {
#     return this.roundPrice(Number.parseFloat(originalPrice) * this._revenue);
#   }

#   roundPrice(price) {
#     const basePrice = Math.trunc(price / 1000);
#     const initialDelta = price % 1000;

#     const delta = [0, 500, 900].reduce((acc, rest) => {
#       if (Math.abs(rest - initialDelta) <= acc.delta) {
#         acc.newPrice = rest;
#         acc.delta = Math.abs(rest - acc.delta);
#       }

#       return acc;
#     }, { newPrice: null, delta: initialDelta });

#     return (basePrice) * 1000 + delta.newPrice;
#   }
