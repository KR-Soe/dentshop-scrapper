const authentication = (req, res, next) => {
  if (!req.cookies.userSignedIn) {
    res.redirect('/');
    return;
  }

  next();
};

module.exports = authentication;
