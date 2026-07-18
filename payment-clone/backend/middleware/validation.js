const { sendError } = require('../utils/apiResponse');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value) => value.trim().toLowerCase();
const validationError = (res, errors) => sendError(res, 422, 'Validation failed.', errors);

const validateRegister = (req, res, next) => {
  const { full_name: fullNameSnake, fullName: fullNameCamel, email, password } = req.body;
  const fullName = typeof fullNameSnake === 'string' ? fullNameSnake : fullNameCamel;
  const errors = [];
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 255) errors.push({ field: 'full_name', message: 'Full name must be between 2 and 255 characters.' });
  if (typeof email !== 'string' || email.length > 255 || !emailPattern.test(email.trim())) errors.push({ field: 'email', message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) errors.push({ field: 'password', message: 'Password must be between 8 and 128 characters.' });
  if (errors.length) return validationError(res, errors);
  req.validated = { fullName: fullName.trim(), email: normalizeEmail(email), password };
  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) errors.push({ field: 'email', message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length === 0) errors.push({ field: 'password', message: 'Password is required.' });
  if (errors.length) return validationError(res, errors);
  req.validated = { email: normalizeEmail(email), password };
  return next();
};

const validateRefresh = (req, res, next) => {
  if (typeof req.body.refreshToken !== 'string' || req.body.refreshToken.length < 20) return validationError(res, [{ field: 'refreshToken', message: 'A valid refresh token is required.' }]);
  req.validated = { refreshToken: req.body.refreshToken };
  return next();
};

const validateProfileUpdate = (req, res, next) => {
  const { full_name: fullNameSnake, fullName: fullNameCamel, email } = req.body;
  const fullName = typeof fullNameSnake === 'string' ? fullNameSnake : fullNameCamel;
  const errors = [];
  if (fullName === undefined && email === undefined) errors.push({ field: 'body', message: 'Provide full_name or email to update.' });
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 255)) errors.push({ field: 'full_name', message: 'Full name must be between 2 and 255 characters.' });
  if (email !== undefined && (typeof email !== 'string' || email.length > 255 || !emailPattern.test(email.trim()))) errors.push({ field: 'email', message: 'Enter a valid email address.' });
  if (errors.length) return validationError(res, errors);
  req.validated = { ...(fullName !== undefined && { fullName: fullName.trim() }), ...(email !== undefined && { email: normalizeEmail(email) }) };
  return next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) errors.push({ field: 'currentPassword', message: 'Current password is required.' });
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) errors.push({ field: 'newPassword', message: 'New password must be between 8 and 128 characters.' });
  if (currentPassword && currentPassword === newPassword) errors.push({ field: 'newPassword', message: 'New password must be different from the current password.' });
  if (errors.length) return validationError(res, errors);
  req.validated = { currentPassword, newPassword };
  return next();
};

module.exports = { validateRegister, validateLogin, validateRefresh, validateProfileUpdate, validatePasswordChange };
