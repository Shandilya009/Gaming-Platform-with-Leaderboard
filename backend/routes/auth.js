import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to generate JWT token for authenticated users
 * @param {string} userId - User's database ID
 * @returns {string} - Signed JWT token valid for 7 days
 */
const generateAuthToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

/**
 * Helper function to format user data for API responses
 * Excludes sensitive information like password hash
 * @param {Object} user - User document from database
 * @returns {Object} - Safe user data for frontend
 */
const formatUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  totalPoints: user.totalPoints,
  role: user.role || 'user',
  status: user.status || 'active'
});

/**
 * POST /auth/register
 * Register a new user account
 * 
 * Request body: { username, email, password }
 * Response: { message, token, user }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !username.trim()) {
      return res.status(400).json({ 
        message: 'Username is required' 
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Username must be at least 3 characters' 
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ 
        message: 'Password is required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists with this email or username
    const existingUser = await User.findOne({ 
      $or: [{ email: email.trim().toLowerCase() }, { username: username.trim() }] 
    });
    
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ 
        message: `${conflictField} already ${conflictField === 'Email' ? 'registered' : 'taken'}` 
      });
    }

    // Create new user (password will be automatically hashed by User model)
    const user = new User({ username, email, password });
    await user.save();

    // Generate authentication token
    const token = generateAuthToken(user._id);

    // Send success response with token and user data
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user)
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

/**
 * POST /auth/login
 * Authenticate existing user
 * 
 * Request body: { email, password }
 * Response: { message, token, user }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ 
        message: 'Password is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Verify password using User model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate authentication token
    const token = generateAuthToken(user._id);

    // Send success response with token and user data
    res.json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
  }
});

/**
 * GET /auth/me
 * Get current user data (for refreshing user info)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
