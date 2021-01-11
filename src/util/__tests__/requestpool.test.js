const requestpool = require('../requestpool');

describe('> util/requestpool', () => {
  beforeEach(() => {
    requestpool.clear();
  });

  test('getting a promise to execute async code', () => {
    const asyncFunction = () => {
      return Promise.resolve(123);
    };

    return expect(requestpool.add(asyncFunction)).resolves.toBe(123);
  });

  test('setting an array of promises to be executed', () => {
    const asyncFunctions = [
      () => Promise.resolve(123),
      () => new Promise((resolve) => setTimeout(() => resolve('potato'), 700)),
      () => Promise.resolve(false)
    ].map(fn => requestpool.add(fn));

    return Promise.all(asyncFunctions).then(results => {
      expect(results[0]).toBe(123);
      expect(results[1]).toBe('potato');
      expect(results[2]).toBe(false);
    });
  });
});
