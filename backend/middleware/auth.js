import jwt from 'jsonwebtoken';

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
