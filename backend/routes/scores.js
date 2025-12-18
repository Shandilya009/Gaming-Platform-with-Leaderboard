import express from 'express';
import Score from '../models/Score.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to validate and parse limit parameter
 * @param {string} limitParam - Limit query parameter
 * @param {number} defaultLimit - Default limit if none provided
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {number} - Validated limit value
 */
const parseLimit = (limitParam, defaultLimit = 100, maxLimit = 1000) => {
  const limit = parseInt(limitParam) || defaultLimit;
  return Math.min(limit, maxLimit); // Prevent excessive queries
};

/**
 * POST /scores
 * Submit a new score for a game (requires authentication)
 * 
 * This endpoint handles:
 * 1. Recording the score in the database
 * 2. Updating user's total points
 * 3. Incrementing game popularity counter
 * 
 * Request body: { gameId, score }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { gameId, score } = req.body;
    const userId = req.userId; // From auth middleware

    // Step 1: Validate that the game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    // Step 2: Create and save the score record
    const newScore = new Score({
      userId,
      gameId,
      score
    });
    await newScore.save();

    // Step 3: Update user's total points (add this score to their total)
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: score }
    });

    // Step 4: Increase game popularity (tracks how many times it's been played)
    await Game.findByIdAndUpdate(gameId, {
      $inc: { popularity: 1 }
    });

    res.status(201).json({
      message: 'Score submitted successfully',
      score: newScore,
      pointsEarned: score
    });
    
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ 
      message: 'Server error while submitting score', 
      error: error.message 
    });
  }
});

/**
 * GET /scores/leaderboard/global
 * Get global leaderboard showing top users by total points
 * 
 * Query parameters:
 * - limit: Number of users to return (default: 100, max: 1000)
 */
router.get('/leaderboard/global', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    
    // Get top users sorted by total points (highest first)
    const leaderboard = await User.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('username totalPoints createdAt'); // Only return needed fields

    res.json(leaderboard);
    
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ 
      message: 'Server error while fetching global leaderboard', 
      error: error.message 
    });
  }
});

/**
 * GET /scores/game/:gameId
 * Get leaderboard for a specific game showing top scores
 * 
 * Parameters:
 * - gameId: Game's MongoDB ObjectId
 * Query parameters:
 * - limit: Number of scores to return (default: 100, max: 1000)
 */
router.get('/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const limit = parseLimit(req.query.limit);
    
    // Get top scores for this game (highest first)
    // Populate user and game information for display
    const leaderboard = await Score.find({ gameId })
      .sort({ score: -1 })
      .limit(limit)
      .populate('userId', 'username')  // Get username from User model
      .populate('gameId', 'name');     // Get game name from Game model

    res.json(leaderboard);
    
  } catch (error) {
    console.error('Error fetching game leaderboard:', error);
    res.status(500).json({ 
      message: 'Server error while fetching game leaderboard', 
      error: error.message 
    });
  }
});

/**
 * GET /scores/user
 * Get all scores for the authenticated user (requires authentication)
 * 
 * Returns user's score history sorted by most recent first
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    // Get all scores for this user (most recent first)
    // Populate game information for display
    const scores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .populate('gameId', 'name difficulty type'); // Get game details

    res.json(scores);
    
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user scores', 
      error: error.message 
    });
  }
});

export default router;
