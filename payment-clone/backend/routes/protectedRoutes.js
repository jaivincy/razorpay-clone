const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { getProtectedProfile } = require('../controllers/protectedController');

const router = express.Router();

router.get('/profile', authenticateToken, getProtectedProfile);

module.exports = router;