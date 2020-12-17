function authenticate(req, res) {
  const { username, password } = req.body;

  req.logger.info('username %s', username);
  req.logger.info('password %s', password);

  const successfulLogin = username === 'John' && password === 'Doe';

  if (successfulLogin) {
    res.cookie('userSignedIn', true);
  } else {
    res.clearCookie('userSignedIn');
  }

  res.json({ success: successfulLogin });
}

module.exports = authenticate;
