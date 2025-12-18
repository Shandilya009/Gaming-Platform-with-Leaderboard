import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
  totalPoints: user.totalPoints
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

    // Check if user already exists with this email or username
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
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

    // Find user by email
    const user = await User.findOne({ email });
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

export default router;
