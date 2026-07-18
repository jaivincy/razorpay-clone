const rateLimit = require('express-rate-limit');

const standardResponse = (message) => ({
  success: false,
  message,
  errors: [],
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json(standardResponse('Too many requests. Please try again later.')),
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json(standardResponse('Too many authentication attempts. Please try again later.')),
});

module.exports = { apiRateLimiter, authRateLimiter };