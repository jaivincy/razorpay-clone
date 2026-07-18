const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { bcryptSaltRounds, refreshTokenTtlSeconds } = require('../config/env');
const { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

const publicUser = (user) => ({ id: user.id, full_name: user.full_name, email: user.email, created_at: user.created_at, updated_at: user.updated_at });

const issueSession = async (client, user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const expiresAt = new Date(Date.now() + refreshTokenTtlSeconds * 1000);
  await client.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, hashToken(refreshToken), expiresAt],
  );
  return { accessToken, refreshToken, tokenType: 'Bearer' };
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.validated;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
    const { rows } = await client.query(
      `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at, updated_at`,
      [fullName, email, passwordHash],
    );
    const user = rows[0];
    const tokens = await issueSession(client, user);
    await client.query('COMMIT');
    return sendSuccess(res, 201, 'Account created successfully.', { user: publicUser(user), tokens });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new AppError('An account with this email already exists.', 409);
    throw error;
  } finally {
    client.release();
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new AppError('Invalid email or password.', 401);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tokens = await issueSession(client, user);
    await client.query('COMMIT');
    return sendSuccess(res, 200, 'Login successful.', { user: publicUser(user), tokens });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated;
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError('Refresh token is invalid or expired.', 401);
  }
  if (payload.type !== 'refresh') throw new AppError('Refresh token is invalid.', 401);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT rt.id AS token_id, u.id, u.full_name, u.email, u.created_at, u.updated_at
       FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW() FOR UPDATE`,
      [hashToken(refreshToken)],
    );
    const record = rows[0];
    if (!record || record.id !== payload.sub) throw new AppError('Refresh token is invalid or expired.', 401);
    await client.query('DELETE FROM refresh_tokens WHERE id = $1', [record.token_id]);
    const tokens = await issueSession(client, record);
    await client.query('COMMIT');
    return sendSuccess(res, 200, 'Session refreshed.', { user: publicUser(record), tokens });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated;
  await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hashToken(refreshToken)]);
  return sendSuccess(res, 200, 'Logged out successfully.');
});

module.exports = { register, login, refresh, logout };
