import mongoose from 'mongoose';

/**
 * AdminSession Model Schema
 * Tracks admin login sessions for security and audit
 */
const adminSessionSchema = new mongoose.Schema({
  // Admin user reference
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  
  // Admin username (denormalized)
  adminUsername: {
    type: String,
    required: true
  },
  
  // Session token (JWT token hash for reference)
  tokenHash: {
    type: String,
    required: true
  },
  
  // Login timestamp
  loginAt: {
    type: Date,
    default: Date.now
  },
  
  // Logout timestamp (null if still active)
  logoutAt: {
    type: Date,
    default: null
  },
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'expired', 'logged_out', 'revoked'],
    default: 'active'
  },
  
  // IP address at login
  ipAddress: {
    type: String,
    default: null
  },
  
  // User agent at login
  userAgent: {
    type: String,
    default: null
  },
  
  // Device info
  deviceInfo: {
    browser: { type: String, default: null },
    os: { type: String, default: null },
    device: { type: String, default: null }
  },
  
  // Location info (if available)
  location: {
    country: { type: String, default: null },
    city: { type: String, default: null }
  },
  
  // Last activity timestamp
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Number of actions performed in this session
  actionsCount: {
    type: Number,
    default: 0
  },
  
  // Session expiry time
  expiresAt: {
    type: Date,
    required: true
  }
});

// Indexes
adminSessionSchema.index({ adminId: 1, status: 1 });
adminSessionSchema.index({ tokenHash: 1 });
adminSessionSchema.index({ status: 1, expiresAt: 1 });
adminSessionSchema.index({ loginAt: -1 });

// Update last activity
adminSessionSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  this.actionsCount += 1;
  await this.save();
};

// End session
adminSessionSchema.methods.endSession = async function(reason = 'logged_out') {
  this.status = reason;
  this.logoutAt = new Date();
  await this.save();
};

export default mongoose.model('AdminSession', adminSessionSchema);
