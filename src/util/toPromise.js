const makePromise = (fn) => {
  return new Promise((resolve, reject) => {
    fn((err, result) => err ? reject(err) : resolve(result));
  });
};

module.exports = makePromise;
