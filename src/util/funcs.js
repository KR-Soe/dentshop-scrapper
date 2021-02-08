const prop = p => obj => obj[p];

const LazyBox = f => ({
  map: (g) => LazyBox(() => g(f())),
  fold: (g) => g(f()),
  inspect: `LazyBox(${f})`
});

const Right = (x) => ({
  map: (f) => Right(f(x)),
  fold: (_, f) => f(x)
});

const Left = (x) => ({
  map: () => Left(x),
  fold: (f) => f(x)
});

// const Either = {
//   fromNullable,
//   tryCatch
// };

module.exports = {
  prop,
  LazyBox,
  Left,
  Right
};
