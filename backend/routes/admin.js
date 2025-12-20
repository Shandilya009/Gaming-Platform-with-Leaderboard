import express from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Score from '../models/Score.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /admin/stats
 * Get platform statistics for admin dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    const totalScores = await Score.countDocuments();
    
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const gamesPlayedToday = await Score.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get this week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    
    const gamesPlayedThisWeek = await Score.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get active users (played in last 7 days)
    const activeUserIds = await Score.distinct('userId', {
      createdAt: { $gte: weekAgo }
    });
    const activeUsers = activeUserIds.length;
    
    // Get banned users count
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    
    // Get most popular games
    const popularGames = await Game.find()
      .sort({ popularity: -1 })
      .limit(5)
      .select('name popularity type');
    
    // Get recent signups
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt totalPoints');
    
    // Get top players
    const topPlayers = await User.find({ status: 'active' })
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('username totalPoints');
    
    // Calculate total points in system
    const totalPointsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);
    const totalPointsInSystem = totalPointsResult[0]?.total || 0;
    
    // Get daily activity for last 7 days
    const dailyActivity = await Score.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          gamesPlayed: { $sum: 1 },
          totalPoints: { $sum: '$finalScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalGames,
        totalScores,
        totalPointsInSystem,
        activeUsers,
        bannedUsers
      },
      today: {
        newUsers: newUsersToday,
        gamesPlayed: gamesPlayedToday
      },
      thisWeek: {
        newUsers: newUsersThisWeek,
        gamesPlayed: gamesPlayedThisWeek
      },
      popularGames,
      recentUsers,
      topPlayers,
      dailyActivity
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /admin/users
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 15, 
      search = '',
      status = '',
      role = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const total = await User.countDocuments(filter);
    
    const users = await User.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /admin/users/:id
 * Update user (ban, unban, change role)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { status, role, banReason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (status) user.status = status;
    if (role) user.role = role;
    if (banReason) user.banReason = banReason;
    
    await user.save();
    
    res.json({ message: 'User updated successfully', user });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /admin/users/:id
 * Delete user and their scores
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's scores
    await Score.deleteMany({ userId: req.params.id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// SCORE MANAGEMENT
// ============================================

/**
 * GET /admin/scores
 * Get all scores with pagination and filters
 */
router.get('/scores', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      gameId = '',
      userId = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const filter = {};
    
    if (gameId) filter.gameId = gameId;
    if (userId) filter.userId = userId;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const total = await Score.countDocuments(filter);
    
    const scores = await Score.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username email')
      .populate('gameId', 'name type');
    
    res.json({
      scores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /admin/scores/:id
 * Delete a specific score
 */
router.delete('/scores/:id', async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    // Update user's total points
    const user = await User.findById(score.userId);
    if (user) {
      user.totalPoints = Math.max(0, user.totalPoints - score.finalScore);
      await user.save();
    }
    
    await Score.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Score deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
