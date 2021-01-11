const { TestScheduler } = require('jest');
const makePromise = require('../toPromise');

describe('> util/toPromise.js', () => {
  let successCallback;
  let failCallback;

  beforeEach(() => {
    successCallback = (fn) => {
      setTimeout(() => {
        fn(null, 'yay');
      }, 0);
    };

    failCallback = (fn) => {
      setTimeout(() => {
        fn('outch');
      }, 0);
    };
  });

  test('a successful callback will be triggered properly', () => {
    const prom = makePromise((done) => successCallback(done));
    return expect(prom).resolves.toBe('yay');
  });

  test('a failed callback will be triggered properly', () => {
    const prom = makePromise((done) => failCallback(done));
    return expect(prom).rejects.toBe('outch');
  });
});
