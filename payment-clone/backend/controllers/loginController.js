const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { createAccessToken } = require('../utils/token');

const login = async (req, res, next) => {
  const { email, password } = req.loginData;

  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, password_hash, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const accessToken = createAccessToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login };