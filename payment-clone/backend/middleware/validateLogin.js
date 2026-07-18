const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  req.loginData = { email: email.trim().toLowerCase(), password };
  next();
};

module.exports = validateLogin;