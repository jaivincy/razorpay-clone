const { verifyAccessToken } = require('../utils/token');
const { sendError } = require('../utils/apiResponse');

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'A Bearer access token is required.');
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') return sendError(res, 401, 'Authentication token is invalid.');
    req.user = payload;
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Authentication token has expired.' : 'Authentication token is invalid.';
    return sendError(res, 401, message);
  }
};

module.exports = authenticateToken;