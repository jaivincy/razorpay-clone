const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { bcryptSaltRounds } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

const getProfile = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT full_name, email, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [req.user.sub],
  );
  if (!rows[0]) throw new AppError('User profile not found.', 404);
  return sendSuccess(res, 200, 'Profile retrieved successfully.', { user: rows[0] });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.validated;
  const fields = [];
  const values = [];
  if (fullName !== undefined) { values.push(fullName); fields.push(`full_name = $${values.length}`); }
  if (email !== undefined) { values.push(email); fields.push(`email = $${values.length}`); }
  values.push(req.user.sub);

  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING full_name, email, created_at, updated_at`,
      values,
    );
    if (!rows[0]) throw new AppError('User profile not found.', 404);
    return sendSuccess(res, 200, 'Profile updated successfully.', { user: rows[0] });
  } catch (error) {
    if (error.code === '23505') throw new AppError('An account with this email already exists.', 409);
    throw error;
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated;
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1 LIMIT 1', [req.user.sub]);
  const user = rows[0];
  if (!user) throw new AppError('User profile not found.', 404);
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) throw new AppError('Current password is incorrect.', 401);

  const passwordHash = await bcrypt.hash(newPassword, bcryptSaltRounds);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.sub]);
  return sendSuccess(res, 200, 'Password changed successfully.');
});

module.exports = { getProfile, updateProfile, changePassword };