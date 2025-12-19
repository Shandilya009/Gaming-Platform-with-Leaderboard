import mongoose from 'mongoose';

/**
 * AdminLog Model Schema
 * Tracks all admin activities for audit purposes
 * Every admin action is logged with full details
 */
const adminLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  
  // Admin username (denormalized for quick access)
  adminUsername: {
    type: String,
    required: true
  },
  
  // Type of action performed
  action: {
    type: String,
    enum: [
      // User management
      'USER_VIEW', 'USER_UPDATE', 'USER_DELETE', 'USER_BAN', 'USER_UNBAN', 
      'USER_ROLE_CHANGE', 'USER_SUSPEND',
      // Game management
      'GAME_CREATE', 'GAME_UPDATE', 'GAME_DELETE', 'GAME_VIEW',
      // Score management
      'SCORE_VIEW', 'SCORE_DELETE',
      // Dashboard
      'DASHBOARD_VIEW', 'STATS_VIEW',
      // Admin session
      'ADMIN_LOGIN', 'ADMIN_LOGOUT',
      // Settings
      'SETTINGS_UPDATE', 'SETTINGS_VIEW',
      // Other
      'OTHER'
    ],
    required: [true, 'Action type is required']
  },
  
  // Category of the action
  category: {
    type: String,
    enum: ['user', 'game', 'score', 'dashboard', 'session', 'settings', 'other'],
    required: true
  },
  
  // Target entity type (user, game, score, etc.)
  targetType: {
    type: String,
    enum: ['user', 'game', 'score', 'settings', 'system', null],
    default: null
  },
  
  // Target entity ID
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Target entity name/identifier (denormalized)
  targetName: {
    type: String,
    default: null
  },
  
  // Description of the action
  description: {
    type: String,
    required: true
  },
  
  // Previous state (for updates)
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // New state (for updates)
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // IP address of the admin
  ipAddress: {
    type: String,
    default: null
  },
  
  // User agent string
  userAgent: {
    type: String,
    default: null
  },
  
  // Status of the action
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  
  // Error message if action failed
  errorMessage: {
    type: String,
    default: null
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ category: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ status: 1 });

// Static method to create a log entry
adminLogSchema.statics.log = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating admin log:', error);
    return null;
  }
};

export default mongoose.model('AdminLog', adminLogSchema);
