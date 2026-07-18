const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtAccessExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/env');

const jwtOptions = { algorithm: 'HS256', issuer: 'payflow-api', audience: 'payflow-client' };

const createAccessToken = (user) => jwt.sign(
  { sub: user.id, email: user.email, type: 'access' },
  jwtAccessSecret,
  { ...jwtOptions, expiresIn: jwtAccessExpiresIn },
);

const createRefreshToken = (user) => jwt.sign(
  { sub: user.id, type: 'refresh', jti: crypto.randomUUID() },
  jwtRefreshSecret,
  { ...jwtOptions, expiresIn: jwtRefreshExpiresIn },
);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const verifyAccessToken = (token) => jwt.verify(token, jwtAccessSecret, jwtOptions);
const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret, jwtOptions);

module.exports = { createAccessToken, createRefreshToken, hashToken, verifyAccessToken, verifyRefreshToken };