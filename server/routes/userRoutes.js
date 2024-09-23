const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Protected routes (require authentication)
// Route to get the logged-in user's profile
router.get('/profile', protect, getUserProfile);

// Route to update the user's profile
router.put('/profile', protect, updateUserProfile);

// Route to change the user's password
router.put('/change-password', protect, changePassword);

// Route to delete the user's account
router.delete('/delete-account', protect, deleteUser);

module.exports = router;
