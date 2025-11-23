const express = require('express');
const { userController } = require('../controllers/user');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.createUser);

// Protected routes
router.get('/me', authenticateToken, userController.getCurrentUser);
router.get('/all', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
// router.put('/:id', authenticateToken, userController.updateUser);
// router.delete('/:id', authenticateToken, userController.deleteUser);
// router.post('/logout', authenticateToken, userController.logout);

module.exports = router;
