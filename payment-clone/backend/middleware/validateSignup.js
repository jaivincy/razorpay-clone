const validateSignup = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const errors = [];

  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 255) {
    errors.push('fullName must be between 2 and 255 characters.');
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 255) {
    errors.push('email must be a valid email address.');
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    errors.push('password must be between 8 and 128 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Invalid signup data.', errors });
  }

  req.signupData = {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
  };

  next();
};

module.exports = validateSignup;