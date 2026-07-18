const { nodeEnv } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.code === '23505' ? 409 : 500);
  const message = err.isOperational ? err.message : statusCode === 409 ? 'A record with that value already exists.' : 'Internal server error.';
  const errors = Array.isArray(err.errors) ? err.errors : [];

  if (statusCode >= 500) {
    console.error(err);
  }

  const response = { success: false, message, errors };
  if (nodeEnv === 'development' && statusCode >= 500) response.debugId = req.id;
  return res.status(statusCode).json(response);
};

module.exports = errorHandler;