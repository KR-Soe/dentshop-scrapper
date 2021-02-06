const middleware = logger => (req, _, next) => {
  req.logger = logger;
  next();
};

module.exports = middleware;
