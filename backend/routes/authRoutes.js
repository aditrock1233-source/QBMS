const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser,
} = require('../controllers/authController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes (must be logged in)
router.get('/profile', protect, getUserProfile);

// Admin only routes
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id', protect, authorizeRoles('admin'), updateUser);

module.exports = router;
