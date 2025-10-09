const express = require('express');
const { userController } = require('../controllers/users');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.register);

// Protected routes
router.post('/logout', authenticateToken, userController.logout);
router.get('/validate-token', authenticateToken, userController.validateToken);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/users', authenticateToken, userController.getAllUsers);

module.exports = router;
