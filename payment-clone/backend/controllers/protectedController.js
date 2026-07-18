const { sendSuccess } = require('../utils/apiResponse');

const getProtectedProfile = (req, res) => sendSuccess(res, 200, 'You have access to this protected endpoint.', {
  user: { id: req.user.sub, email: req.user.email },
});

module.exports = { getProtectedProfile };