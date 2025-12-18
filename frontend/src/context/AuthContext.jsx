import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

/**
 * Authentication Context
 * Manages user authentication state and provides auth-related functions
 * throughout the application
 */

// Create the authentication context
const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context
 * Must be used within AuthProvider component
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // User state: null = not logged in, object = logged in user data
  const [user, setUser] = useState(null);
  
  // Loading state: true while checking for existing authentication
  const [loading, setLoading] = useState(true);

  /**
   * Initialize authentication state on app load
   * Checks localStorage for existing token and user data
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for stored authentication data
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // If both token and user data exist, restore user session
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        // Handle corrupted localStorage data
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * Authenticates user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, message?: string }
   */
  const login = async (email, password) => {
    try {
      // Call login API
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return { success: true };
      
    } catch (error) {
      // Handle login errors
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('Login error:', errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  /**
   * Registration function
   * Creates new user account
   * @param {string} username - Desired username
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, message?: string }
   */
  const register = async (username, email, password) => {
    try {
      // Call registration API
      const response = await authAPI.register({ username, email, password });
      const { token, user: userData } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return { success: true };
      
    } catch (error) {
      // Handle registration errors
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error('Registration error:', errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  /**
   * Logout function
   * Clears user session and authentication data
   */
  const logout = () => {
    // Clear stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear user state
    setUser(null);
    
    console.log('User logged out successfully');
  };

  /**
   * Update user points after completing a game
   * Keeps local user data in sync with backend
   * @param {number} points - Points earned from the game
   */
  const updateUserPoints = (points) => {
    if (!user) return;
    
    // Create updated user object with new total points
    const updatedUser = { 
      ...user, 
      totalPoints: user.totalPoints + points 
    };
    
    // Update state and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log(`User earned ${points} points. New total: ${updatedUser.totalPoints}`);
  };

  // Context value object containing all auth-related data and functions
  const contextValue = {
    user,                           // Current user data (null if not logged in)
    login,                          // Login function
    register,                       // Registration function
    logout,                         // Logout function
    updateUserPoints,               // Update user points function
    isAuthenticated: !!user         // Boolean: true if user is logged in
  };

  // Show loading screen while checking authentication status
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
