import axios from "axios";

/**
 * API Configuration
 * Centralized API client setup for the gaming platform frontend
 */

// Determine API base URL based on environment
// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "https://gaming-platform-backend-api.onrender.com"
    : "http://localhost:5001");

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout for requests
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests if user is authenticated
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request setup errors
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common response scenarios (like token expiration)
 */
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses (expired/invalid token)
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API endpoints
 * Handles user registration and login
 */
export const authAPI = {
  // Register new user account
  register: (userData) => api.post("/auth/register", userData),

  // Login existing user
  login: (credentials) => api.post("/auth/login", credentials),
};

/**
 * Games API endpoints
 * Handles game CRUD operations
 */
export const gamesAPI = {
  // Get all games with optional filters (difficulty, type, sort)
  getAll: (filterParams) => api.get("/games", { params: filterParams }),

  // Get specific game by ID
  getById: (gameId) => api.get(`/games/${gameId}`),

  // Create new game (admin only)
  create: (gameData) => api.post("/games", gameData),

  // Update existing game (admin only)
  update: (gameId, gameData) => api.put(`/games/${gameId}`, gameData),

  // Delete game (admin only)
  delete: (gameId) => api.delete(`/games/${gameId}`),
};

/**
 * Scores API endpoints
 * Handles score submission and leaderboard retrieval
 */
export const scoresAPI = {
  // Submit score for a completed game
  submit: (scoreData) => api.post("/scores", scoreData),

  // Get current user's score history
  getUserScores: () => api.get("/scores/user"),

  // Get leaderboard for specific game
  getGameLeaderboard: (gameId, limit = 100) =>
    api.get(`/scores/game/${gameId}`, { params: { limit } }),

  // Get global leaderboard (all users by total points)
  getGlobalLeaderboard: (limit = 100) =>
    api.get("/scores/leaderboard/global", { params: { limit } }),
};

// Export the configured axios instance as default
export default api;
