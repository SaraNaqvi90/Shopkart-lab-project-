const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', customerController.registerUser);

router.post('/login', customerController.loginUser);

router.get('/me', authMiddleware, customerController.getMe);

router.post('/logout', authMiddleware, customerController.logoutUser);

module.exports = router;