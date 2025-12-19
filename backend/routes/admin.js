import express from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Score from '../models/Score.js';
import AdminLog from '../models/AdminLog.js';
import AdminSession from '../models/AdminSession.js';
import AdminSettings from '../models/AdminSettings.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { logAdminAction } from '../utils/adminLogger.js';

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
    // Log dashboard view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'STATS_VIEW',
      targetType: 'system',
      description: 'Viewed admin dashboard statistics',
      req
    });

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
      {
        $match: { createdAt: { $gte: weekAgo } }
      },
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
      limit = 20, 
      search = '', 
      status = '',
      role = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (role) {
      filter.role = role;
    }
    
    // Build sort
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    // Get users
    const users = await User.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    // Log user list view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'USER_VIEW',
      targetType: 'user',
      description: `Viewed user list (page ${page}, ${users.length} users)`,
      metadata: { page, limit, search, status, role, total },
      req
    });
    
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
 * GET /admin/users/:id
 * Get single user details with their scores
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's recent scores
    const recentScores = await Score.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('gameId', 'name type');
    
    // Get user's game stats
    const gameStats = await Score.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$gameId',
          totalPlays: { $sum: 1 },
          totalPoints: { $sum: '$finalScore' },
          bestScore: { $max: '$finalScore' },
          avgScore: { $avg: '$finalScore' }
        }
      }
    ]);

    // Log user detail view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'USER_VIEW',
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: `Viewed user details: ${user.username}`,
      req
    });
    
    res.json({
      user,
      recentScores,
      gameStats
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


/**
 * PUT /admin/users/:id
 * Update user (change role, status, etc.)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { role, status, banReason } = req.body;
    const userId = req.params.id;
    
    // Prevent admin from modifying themselves
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot modify your own account' });
    }

    // Get current user state for logging
    const currentUser = await User.findById(userId).select('-password');
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousState = {
      role: currentUser.role,
      status: currentUser.status,
      banReason: currentUser.banReason
    };
    
    const updateData = {};
    let actionType = 'USER_UPDATE';
    let actionDescription = `Updated user: ${currentUser.username}`;
    
    if (role && ['user', 'admin'].includes(role)) {
      updateData.role = role;
      if (role !== currentUser.role) {
        actionType = 'USER_ROLE_CHANGE';
        actionDescription = `Changed role for ${currentUser.username}: ${currentUser.role} → ${role}`;
      }
    }
    
    if (status && ['active', 'banned', 'suspended'].includes(status)) {
      updateData.status = status;
      if (status === 'banned') {
        updateData.banReason = banReason || 'Violation of terms of service';
        actionType = 'USER_BAN';
        actionDescription = `Banned user: ${currentUser.username}. Reason: ${updateData.banReason}`;
      } else if (status === 'active' && currentUser.status === 'banned') {
        updateData.banReason = null;
        actionType = 'USER_UNBAN';
        actionDescription = `Unbanned user: ${currentUser.username}`;
      } else if (status === 'suspended') {
        actionType = 'USER_SUSPEND';
        actionDescription = `Suspended user: ${currentUser.username}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    // Log the action
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: actionType,
      targetType: 'user',
      targetId: user._id,
      targetName: user.username,
      description: actionDescription,
      previousState,
      newState: {
        role: user.role,
        status: user.status,
        banReason: user.banReason
      },
      req
    });
    
    res.json({ message: 'User updated successfully', user });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /admin/users/:id
 * Delete a user and all their scores
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store user info for logging before deletion
    const deletedUserInfo = {
      username: user.username,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints
    };
    
    // Count scores to be deleted
    const scoresCount = await Score.countDocuments({ userId });
    
    // Delete all user's scores
    await Score.deleteMany({ userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    // Log the deletion
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'USER_DELETE',
      targetType: 'user',
      targetId: userId,
      targetName: deletedUserInfo.username,
      description: `Deleted user: ${deletedUserInfo.username} (${deletedUserInfo.email})`,
      previousState: deletedUserInfo,
      metadata: { scoresDeleted: scoresCount },
      req
    });
    
    res.json({ message: 'User and all their data deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GAME MANAGEMENT
// ============================================

/**
 * GET /admin/games
 * Get all games with stats
 */
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    
    // Get play counts for each game
    const gamesWithStats = await Promise.all(
      games.map(async (game) => {
        const playCount = await Score.countDocuments({ gameId: game._id });
        const avgScore = await Score.aggregate([
          { $match: { gameId: game._id } },
          { $group: { _id: null, avg: { $avg: '$finalScore' } } }
        ]);
        
        return {
          ...game.toObject(),
          playCount,
          avgScore: Math.round(avgScore[0]?.avg || 0)
        };
      })
    );

    // Log game list view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'GAME_VIEW',
      targetType: 'game',
      description: `Viewed game list (${games.length} games)`,
      req
    });
    
    res.json(gamesWithStats);
    
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


/**
 * POST /admin/games
 * Create a new game
 */
router.post('/games', async (req, res) => {
  try {
    const { name, description, type, difficulty } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !difficulty) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if game name already exists
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      return res.status(400).json({ message: 'Game with this name already exists' });
    }
    
    const game = new Game({ name, description, type, difficulty });
    await game.save();

    // Log game creation
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'GAME_CREATE',
      targetType: 'game',
      targetId: game._id,
      targetName: game.name,
      description: `Created new game: ${game.name}`,
      newState: { name, description, type, difficulty },
      req
    });
    
    res.status(201).json({ message: 'Game created successfully', game });
    
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /admin/games/:id
 * Update a game
 */
router.put('/games/:id', async (req, res) => {
  try {
    const { name, description, type, difficulty } = req.body;

    // Get current game state for logging
    const currentGame = await Game.findById(req.params.id);
    if (!currentGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const previousState = {
      name: currentGame.name,
      description: currentGame.description,
      type: currentGame.type,
      difficulty: currentGame.difficulty
    };

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { name, description, type, difficulty },
      { new: true, runValidators: true }
    );

    // Log game update
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'GAME_UPDATE',
      targetType: 'game',
      targetId: game._id,
      targetName: game.name,
      description: `Updated game: ${game.name}`,
      previousState,
      newState: { name, description, type, difficulty },
      req
    });
    
    res.json({ message: 'Game updated successfully', game });
    
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /admin/games/:id
 * Delete a game and all its scores
 */
router.delete('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Store game info for logging
    const deletedGameInfo = {
      name: game.name,
      description: game.description,
      type: game.type,
      difficulty: game.difficulty,
      popularity: game.popularity
    };
    
    // Count scores to be deleted
    const scoresCount = await Score.countDocuments({ gameId: game._id });
    
    // Delete all scores for this game
    await Score.deleteMany({ gameId: game._id });
    
    // Delete the game
    await Game.findByIdAndDelete(req.params.id);

    // Log game deletion
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'GAME_DELETE',
      targetType: 'game',
      targetId: req.params.id,
      targetName: deletedGameInfo.name,
      description: `Deleted game: ${deletedGameInfo.name}`,
      previousState: deletedGameInfo,
      metadata: { scoresDeleted: scoresCount },
      req
    });
    
    res.json({ message: 'Game and all its scores deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============================================
// SCORE MANAGEMENT
// ============================================

/**
 * GET /admin/scores
 * Get all scores with pagination
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

    // Log score list view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'SCORE_VIEW',
      targetType: 'score',
      description: `Viewed score list (page ${page}, ${scores.length} scores)`,
      metadata: { page, limit, gameId, userId, total },
      req
    });
    
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
 * Delete a score (for moderation)
 */
router.delete('/scores/:id', async (req, res) => {
  try {
    const score = await Score.findById(req.params.id)
      .populate('userId', 'username')
      .populate('gameId', 'name');
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Store score info for logging
    const deletedScoreInfo = {
      finalScore: score.finalScore || score.score,
      userId: score.userId?._id,
      username: score.userId?.username,
      gameId: score.gameId?._id,
      gameName: score.gameId?.name,
      speedScore: score.speedScore,
      accuracyScore: score.accuracyScore,
      consistencyScore: score.consistencyScore
    };
    
    // Subtract points from user
    await User.findByIdAndUpdate(score.userId, {
      $inc: { totalPoints: -(score.finalScore || score.score) }
    });
    
    // Delete the score
    await Score.findByIdAndDelete(req.params.id);

    // Log score deletion
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'SCORE_DELETE',
      targetType: 'score',
      targetId: req.params.id,
      targetName: `${deletedScoreInfo.username}'s score in ${deletedScoreInfo.gameName}`,
      description: `Deleted score: ${deletedScoreInfo.finalScore} points from ${deletedScoreInfo.username} in ${deletedScoreInfo.gameName}`,
      previousState: deletedScoreInfo,
      metadata: { pointsDeducted: deletedScoreInfo.finalScore },
      req
    });
    
    res.json({ message: 'Score deleted and user points adjusted' });
    
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============================================
// ADMIN LOGS
// ============================================

/**
 * GET /admin/logs
 * Get admin activity logs with pagination and filters
 */
router.get('/logs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      action = '',
      category = '',
      adminId = '',
      startDate = '',
      endDate = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const filter = {};
    
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (adminId) filter.adminId = adminId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const total = await AdminLog.countDocuments(filter);
    
    const logs = await AdminLog.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('adminId', 'username email');
    
    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /admin/logs/summary
 * Get summary of admin activities
 */
router.get('/logs/summary', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Actions by category
    const actionsByCategory = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Actions by admin
    const actionsByAdmin = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$adminUsername', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily activity
    const dailyActivity = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent critical actions
    const criticalActions = await AdminLog.find({
      action: { $in: ['USER_DELETE', 'USER_BAN', 'GAME_DELETE', 'SCORE_DELETE', 'USER_ROLE_CHANGE'] },
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(20);

    // Total actions count
    const totalActions = await AdminLog.countDocuments({ createdAt: { $gte: startDate } });

    res.json({
      totalActions,
      actionsByCategory,
      actionsByAdmin,
      dailyActivity,
      criticalActions
    });
    
  } catch (error) {
    console.error('Error fetching logs summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============================================
// ADMIN SESSIONS
// ============================================

/**
 * GET /admin/sessions
 * Get admin session history
 */
router.get('/sessions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status = '',
      adminId = ''
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (adminId) filter.adminId = adminId;
    
    const total = await AdminSession.countDocuments(filter);
    
    const sessions = await AdminSession.find(filter)
      .sort({ loginAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('adminId', 'username email');
    
    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /admin/sessions/active
 * Get currently active admin sessions
 */
router.get('/sessions/active', async (req, res) => {
  try {
    const activeSessions = await AdminSession.find({ 
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
      .sort({ lastActivityAt: -1 })
      .populate('adminId', 'username email');
    
    res.json(activeSessions);
    
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============================================
// ADMIN SETTINGS
// ============================================

/**
 * GET /admin/settings
 * Get all admin settings
 */
router.get('/settings', async (req, res) => {
  try {
    const { category = '' } = req.query;
    
    const filter = { isVisible: true };
    if (category) filter.category = category;
    
    const settings = await AdminSettings.find(filter)
      .sort({ category: 1, key: 1 });

    // Log settings view
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'SETTINGS_VIEW',
      targetType: 'settings',
      description: 'Viewed admin settings',
      req
    });
    
    res.json(settings);
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /admin/settings/:key
 * Update a setting
 */
router.put('/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const { key } = req.params;
    
    // Get current setting for logging
    const currentSetting = await AdminSettings.findOne({ key });
    const previousValue = currentSetting?.value;
    
    const setting = await AdminSettings.setValue(key, value, req.userId);

    // Log settings update
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'SETTINGS_UPDATE',
      targetType: 'settings',
      targetName: key,
      description: `Updated setting: ${key}`,
      previousState: { value: previousValue },
      newState: { value },
      req
    });
    
    res.json({ message: 'Setting updated successfully', setting });
    
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


/**
 * POST /admin/settings
 * Create a new setting
 */
router.post('/settings', async (req, res) => {
  try {
    const { key, value, category, description, dataType } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    
    // Check if setting already exists
    const existingSetting = await AdminSettings.findOne({ key });
    if (existingSetting) {
      return res.status(400).json({ message: 'Setting with this key already exists' });
    }
    
    const setting = new AdminSettings({
      key,
      value,
      category: category || 'general',
      description: description || '',
      dataType: dataType || 'string',
      lastModifiedBy: req.userId
    });
    
    await setting.save();

    // Log settings creation
    await logAdminAction({
      adminId: req.userId,
      adminUsername: req.user.username,
      action: 'SETTINGS_UPDATE',
      targetType: 'settings',
      targetName: key,
      description: `Created new setting: ${key}`,
      newState: { key, value, category },
      req
    });
    
    res.status(201).json({ message: 'Setting created successfully', setting });
    
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
