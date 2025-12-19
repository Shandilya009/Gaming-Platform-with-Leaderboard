import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes that require user authentication
 * 
 * How it works:
 * 1. Extracts token from Authorization header (format: "Bearer <token>")
 * 2. Verifies token using JWT_SECRET from environment variables
 * 3. Adds userId to request object for use in protected routes
 * 4. Calls next() to continue to the actual route handler
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Get the token part after "Bearer "
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required - No token provided' 
      });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID to request object for use in route handlers
    req.userId = decoded.userId;
    
    // Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    // Handle token verification errors
    return res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin role
 * Must be used AFTER authMiddleware
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    // Get user from database to check role
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required' 
      });
    }
    
    // Add user object to request for convenience
    req.user = user;
    
    next();
    
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      message: 'Server error checking admin status' 
    });
  }
};

/**
 * Check Account Status Middleware
 * Verifies that the user account is active (not banned/suspended)
 * Must be used AFTER authMiddleware
 */
export const checkAccountStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status === 'banned') {
      return res.status(403).json({ 
        message: 'Your account has been banned',
        reason: user.banReason || 'Violation of terms of service'
      });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        message: 'Your account has been temporarily suspended'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Account status check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
