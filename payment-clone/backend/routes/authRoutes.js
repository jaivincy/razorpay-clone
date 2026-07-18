const express = require('express');
const { register, login, refresh, logout } = require('../controllers/authController');
const { validateRegister, validateLogin, validateRefresh } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/signup', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', validateRefresh, refresh);
router.post('/logout', validateRefresh, logout);

module.exports = router;