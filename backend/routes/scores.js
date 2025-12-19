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
 * Helper: Parse and validate limit parameter
 */
const parseLimit = (limitParam, defaultLimit = 100, maxLimit = 1000) => {
  const limit = parseInt(limitParam) || defaultLimit;
  return Math.min(Math.max(1, limit), maxLimit);
};

/**
 * Helper: Calculate user statistics from scores
 */
function calculateUserStats(scores) {
  if (!scores || scores.length === 0) {
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
  
  const avgSpeed = Math.round(scores.reduce((sum, s) => sum + (s.speedScore || 0), 0) / scores.length);
  const avgAccuracy = Math.round(scores.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / scores.length);
  const avgConsistency = Math.round(scores.reduce((sum, s) => sum + (s.consistencyScore || 0), 0) / scores.length);

  return {
    gamesPlayed: scores.length,
    averageScore: Math.round(totalPoints / scores.length),
    bestScore,
    totalPoints,
    avgSpeed,
    avgAccuracy,
    avgConsistency
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

// ============================================
// POST /scores - Submit a new score
// ============================================
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
        speedScore: Math.min(100, Math.max(0, speedScore || 0)),
        accuracyScore: Math.min(100, Math.max(0, accuracyScore || 0)),
        consistencyScore: Math.min(100, Math.max(0, consistencyScore || 0))
      };
      
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

// ============================================
// GET /scores/user - Get user's score history
// ============================================
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all scores with game details, sorted by newest first
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

// ============================================
// GET /scores/user/analytics - Detailed analytics
// ============================================
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
        gameBreakdown: [],
        globalRank: null,
        stats: calculateUserStats([])
      });
    }

    // Calculate comprehensive analytics
    const stats = calculateUserStats(scores);
    const skillImpact = calculateSkillImpact(scores);
    
    // Get best score with details
    const bestScoreEntry = scores.reduce((best, current) => {
      const currentVal = current.finalScore || current.score || 0;
      const bestVal = best ? (best.finalScore || best.score || 0) : 0;
      return currentVal > bestVal ? current : best;
    }, null);

    const bestScore = bestScoreEntry ? {
      score: bestScoreEntry.finalScore || bestScoreEntry.score,
      game: bestScoreEntry.gameId?.name,
      date: bestScoreEntry.createdAt,
      breakdown: getScoreBreakdown(bestScoreEntry)
    } : null;

    // Get progress data (last 10 scores)
    const progressData = scores.slice(0, 10).reverse().map(s => ({
      date: s.createdAt,
      score: s.finalScore || s.score,
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
      gameBreakdown[gameName].totalScore += (s.finalScore || s.score || 0);
      gameBreakdown[gameName].bestScore = Math.max(
        gameBreakdown[gameName].bestScore, 
        s.finalScore || s.score || 0
      );
    });

    // Get user's global rank
    const globalRank = await getUserGlobalRank(userId);

    res.json({
      totalGames: scores.length,
      bestScore,
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

// ============================================
// GET /scores/user/rank - Get user's global rank
// ============================================
router.get('/user/rank', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const rank = await getUserGlobalRank(userId);
    
    // Get user's total points
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get points needed for next rank
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

// ============================================
// GET /scores/game/:gameId - Game leaderboard
// ============================================
router.get('/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const limit = parseLimit(req.query.limit);
    
    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    const leaderboard = await Score.find({ gameId })
      .sort({ finalScore: -1, createdAt: 1 })
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

// ============================================
// GET /scores/leaderboard/global - Global leaderboard
// ============================================
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

export default router;
