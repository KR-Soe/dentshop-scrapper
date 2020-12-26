const authTypes = {
  USERNAME: 'John',
  PASSWORD: 'Doe'
};

function authenticate(req, res) {
  const { username, password } = req.body;

  req.logger.info('username %s', username);
  req.logger.info('password %s', password);

  const successfulLogin = username === authTypes.USERNAME && password === authTypes.PASSWORD;

  if (successfulLogin) {
    res.cookie('userSignedIn', true);
  } else {
    res.clearCookie('userSignedIn');
  }

  res.json({ success: successfulLogin });
}

module.exports = authenticate;
