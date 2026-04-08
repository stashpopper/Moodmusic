const express = require('express');
const router = express.Router();
const { register, login, getUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.get('/user', verifyToken, getUser);

module.exports = router;