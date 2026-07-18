const { sendSuccess } = require('../utils/apiResponse');

const getHealth = (req, res) => sendSuccess(res, 200, 'PayFlow API is running.', { timestamp: new Date().toISOString() });

module.exports = { getHealth };