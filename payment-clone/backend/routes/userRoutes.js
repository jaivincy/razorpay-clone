const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/validation');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.post('/change-password', validatePasswordChange, changePassword);

module.exports = router;