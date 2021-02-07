const PricingService = require('../PricingService');

describe('> services/pricingService.roundPrice', () => {
  let pricingService;

  beforeEach(() => {
    pricingService = new PricingService(1.5);
  });

  test('caculating revenue with 36519 must round it to 36500', () => {
    const actual = pricingService.roundPrice(36519);
    expect(actual).toBe(36500);
  });

  test('calculating resulting revenue with 39332 will round it to 39500', () => {
    const actual = pricingService.roundPrice(39332);
    expect(actual).toBe(39500);
  });

  test('calculating resulting revenue with 35800 will round it to 35900', () => {
    const actual = pricingService.roundPrice(35800);
    expect(actual).toBe(35900);
  });

  test('calculating resulting revenue with 1200 will round it to 100', () => {
    const actual = pricingService.roundPrice(1200);
    expect(actual).toBe(1000);
  });

  test('calculating resulting revenue with 10200 will round it to 10K', () => {
    const actual = pricingService.roundPrice(10200);
    expect(actual).toBe(10000);
  });
});

describe('> services/pricingService.calculatePriceWithRevenue', () => {
  let pricingService;

  beforeEach(() => {
    pricingService = new PricingService(1.5);
  });

  test('adding a revenue of 50% will take 1000 to 1500', () => {
    const actual = pricingService.calculatePriceWithRevenue(1000);
    expect(actual).toBe(1500);
  });

  test('adding a revenue of 50% and round 1735 * 1,5 will calculate to 2602,5 and round it to 2500', () => {
    const actual = pricingService.calculatePriceWithRevenue(1735);
    expect(actual).toBe(2500);
  });
});
