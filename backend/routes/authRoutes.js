const express = require('express');
const { signup, login, verifyEmail } = require('../controllers/authController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/verify/:token
// @desc    Verify user email
// @access  Public
router.get('/verify/:token', verifyEmail);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authorize, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified
    }
  });
});

module.exports = router;