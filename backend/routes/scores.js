import express from 'express';
import Score from '../models/Score.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  calculateFinalScore, 
  calculateMetricsFromGameData,
  getScoreBreakdown,
  calculateSkillImpact 
} from '../utils/scoreCalculator.js';

const router = express.Router();

/**
 * Helper function to validate and parse limit parameter
 */
const parseLimit = (limitParam, defaultLimit = 100, maxLimit = 1000) => {
  const limit = parseInt(limitParam) || defaultLimit;
  return Math.min(limit, maxLimit);
};

/**
 * POST /scores
 * Submit a new score for a game (requires authentication)
 * Supports both legacy (simple score) and enhanced (metrics) submission
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      gameId, 
      score,
      speedScore,
      accuracyScore,
      consistencyScore,
      timeTaken,
      difficulty
    } = req.body;
    const userId = req.userId;

    // Validate game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    let finalScoreData;
    
    // Check if enhanced metrics are provided
    if (speedScore !== undefined || accuracyScore !== undefined) {
      // Enhanced submission with metrics
      const metrics = {
        speedScore: speedScore || 0,
        accuracyScore: accuracyScore || 0,
        consistencyScore: consistencyScore || 0
      };
      
      const calculatedFinalScore = calculateFinalScore(metrics, difficulty || game.difficulty);
      
      finalScoreData = {
        userId,
        gameId,
        speedScore: metrics.speedScore,
        accuracyScore: metrics.accuracyScore,
        consistencyScore: metrics.consistencyScore,
        finalScore: calculatedFinalScore,
        score: calculatedFinalScore, // For backward compatibility
        timeTaken: timeTaken || 0,
        difficulty: difficulty || game.difficulty
      };
    } else {
      // Legacy submission - calculate metrics from score
      const metrics = calculateMetricsFromGameData(
        { score, timeTaken },
        game.type
      );
      
      const calculatedFinalScore = calculateFinalScore(metrics, difficulty || game.difficulty);
      
      finalScoreData = {
        userId,
        gameId,
        speedScore: metrics.speedScore,
        accuracyScore: metrics.accuracyScore,
        consistencyScore: metrics.consistencyScore,
        finalScore: calculatedFinalScore,
        score: score || calculatedFinalScore,
        timeTaken: timeTaken || 0,
        difficulty: difficulty || game.difficulty
      };
    }

    // Create and save score
    const newScore = new Score(finalScoreData);
    await newScore.save();

    // Update user's total points
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: finalScoreData.finalScore }
    });

    // Increase game popularity
    await Game.findByIdAndUpdate(gameId, {
      $inc: { popularity: 1 }
    });

    // Get score breakdown for response
    const breakdown = getScoreBreakdown(newScore);

    res.status(201).json({
      message: 'Score submitted successfully',
      score: newScore,
      breakdown,
      pointsEarned: finalScoreData.finalScore
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
 * GET /scores/user
 * Get all scores for the authenticated user with detailed analytics
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all scores with game details
    const scores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .populate('gameId', 'name difficulty type');

    // Calculate user statistics
    const stats = calculateUserStats(scores);
    
    // Calculate skill impact
    const skillImpact = calculateSkillImpact(scores);

    res.json({
      scores,
      stats,
      skillImpact
    });
    
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user scores', 
      error: error.message 
    });
  }
});

/**
 * GET /scores/user/analytics
 * Get detailed analytics for the authenticated user
 */
router.get('/user/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all scores
    const scores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .populate('gameId', 'name difficulty type');

    if (scores.length === 0) {
      return res.json({
        totalGames: 0,
        bestScore: null,
        averageScore: 0,
        recentScores: [],
        skillImpact: { focus: 0, reflex: 0, accuracy: 0, consistency: 0 },
        progressData: [],
        gameBreakdown: []
      });
    }

    // Calculate comprehensive analytics
    const stats = calculateUserStats(scores);
    const skillImpact = calculateSkillImpact(scores);
    
    // Get best score with details
    const bestScore = scores.reduce((best, current) => 
      (current.finalScore > (best?.finalScore || 0)) ? current : best
    , null);

    // Get progress data (last 10 scores)
    const progressData = scores.slice(0, 10).reverse().map(s => ({
      date: s.createdAt,
      score: s.finalScore,
      game: s.gameId?.name
    }));

    // Game breakdown
    const gameBreakdown = {};
    scores.forEach(s => {
      const gameName = s.gameId?.name || 'Unknown';
      if (!gameBreakdown[gameName]) {
        gameBreakdown[gameName] = {
          name: gameName,
          type: s.gameId?.type,
          plays: 0,
          totalScore: 0,
          bestScore: 0
        };
      }
      gameBreakdown[gameName].plays++;
      gameBreakdown[gameName].totalScore += s.finalScore;
      gameBreakdown[gameName].bestScore = Math.max(gameBreakdown[gameName].bestScore, s.finalScore);
    });

    // Get user's global rank
    const globalRank = await getUserGlobalRank(userId);

    res.json({
      totalGames: scores.length,
      bestScore: bestScore ? {
        score: bestScore.finalScore,
        game: bestScore.gameId?.name,
        date: bestScore.createdAt,
        breakdown: getScoreBreakdown(bestScore)
      } : null,
      averageScore: stats.averageScore,
      recentScores: scores.slice(0, 5),
      skillImpact,
      progressData,
      gameBreakdown: Object.values(gameBreakdown),
      globalRank,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ 
      message: 'Server error while fetching analytics', 
      error: error.message 
    });
  }
});

/**
 * GET /scores/leaderboard/global
 * Get global leaderboard showing top users by total points
 */
router.get('/leaderboard/global', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    
    const leaderboard = await User.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('username totalPoints createdAt');

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
 * Get leaderboard for a specific game
 */
router.get('/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const limit = parseLimit(req.query.limit);
    
    const leaderboard = await Score.find({ gameId })
      .sort({ finalScore: -1 })
      .limit(limit)
      .populate('userId', 'username')
      .populate('gameId', 'name');

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
 * GET /scores/user/rank
 * Get user's current global rank
 */
router.get('/user/rank', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const rank = await getUserGlobalRank(userId);
    
    // Get points needed for next rank
    const user = await User.findById(userId);
    const nextRankUser = await User.findOne({ 
      totalPoints: { $gt: user.totalPoints } 
    }).sort({ totalPoints: 1 });
    
    const pointsToNextRank = nextRankUser 
      ? nextRankUser.totalPoints - user.totalPoints 
      : 0;

    res.json({
      rank,
      totalPoints: user.totalPoints,
      pointsToNextRank,
      nextRankPoints: nextRankUser?.totalPoints || user.totalPoints
    });
    
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ 
      message: 'Server error while fetching rank', 
      error: error.message 
    });
  }
});

/**
 * Helper: Calculate user statistics from scores
 */
function calculateUserStats(scores) {
  if (scores.length === 0) {
    return {
      gamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      totalPoints: 0,
      avgSpeed: 0,
      avgAccuracy: 0,
      avgConsistency: 0
    };
  }

  const totalPoints = scores.reduce((sum, s) => sum + (s.finalScore || s.score || 0), 0);
  const bestScore = Math.max(...scores.map(s => s.finalScore || s.score || 0));
  
  return {
    gamesPlayed: scores.length,
    averageScore: Math.round(totalPoints / scores.length),
    bestScore,
    totalPoints,
    avgSpeed: Math.round(scores.reduce((sum, s) => sum + (s.speedScore || 0), 0) / scores.length),
    avgAccuracy: Math.round(scores.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / scores.length),
    avgConsistency: Math.round(scores.reduce((sum, s) => sum + (s.consistencyScore || 0), 0) / scores.length)
  };
}

/**
 * Helper: Get user's global rank
 */
async function getUserGlobalRank(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  
  const rank = await User.countDocuments({ 
    totalPoints: { $gt: user.totalPoints } 
  });
  
  return rank + 1;
}

export default router;