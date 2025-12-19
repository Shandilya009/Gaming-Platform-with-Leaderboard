import AdminLog from '../models/AdminLog.js';
import AdminSession from '../models/AdminSession.js';
import crypto from 'crypto';

/**
 * Admin Logger Utility
 * Provides helper functions for logging admin activities
 */

// Action to category mapping
const actionCategoryMap = {
  'USER_VIEW': 'user',
  'USER_UPDATE': 'user',
  'USER_DELETE': 'user',
  'USER_BAN': 'user',
  'USER_UNBAN': 'user',
  'USER_ROLE_CHANGE': 'user',
  'USER_SUSPEND': 'user',
  'GAME_CREATE': 'game',
  'GAME_UPDATE': 'game',
  'GAME_DELETE': 'game',
  'GAME_VIEW': 'game',
  'SCORE_VIEW': 'score',
  'SCORE_DELETE': 'score',
  'DASHBOARD_VIEW': 'dashboard',
  'STATS_VIEW': 'dashboard',
  'ADMIN_LOGIN': 'session',
  'ADMIN_LOGOUT': 'session',
  'SETTINGS_UPDATE': 'settings',
  'SETTINGS_VIEW': 'settings',
  'OTHER': 'other'
};

/**
 * Log an admin action
 * @param {Object} options - Log options
 * @returns {Promise<Object>} - Created log entry
 */
export const logAdminAction = async ({
  adminId,
  adminUsername,
  action,
  targetType = null,
  targetId = null,
  targetName = null,
  description,
  previousState = null,
  newState = null,
  metadata = {},
  req = null,
  status = 'success',
  errorMessage = null
}) => {
  try {
    const logData = {
      adminId,
      adminUsername,
      action,
      category: actionCategoryMap[action] || 'other',
      targetType,
      targetId,
      targetName,
      description,
      previousState,
      newState,
      metadata,
      status,
      errorMessage,
      ipAddress: req ? getClientIP(req) : null,
      userAgent: req ? req.headers['user-agent'] : null
    };

    const log = await AdminLog.log(logData);
    return log;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};

/**
 * Create an admin session
 * @param {Object} options - Session options
 * @returns {Promise<Object>} - Created session
 */
export const createAdminSession = async ({
  adminId,
  adminUsername,
  token,
  req = null,
  expiresIn = 7 * 24 * 60 * 60 * 1000 // 7 days default
}) => {
  try {
    // Hash the token for storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const session = new AdminSession({
      adminId,
      adminUsername,
      tokenHash,
      ipAddress: req ? getClientIP(req) : null,
      userAgent: req ? req.headers['user-agent'] : null,
      deviceInfo: req ? parseUserAgent(req.headers['user-agent']) : {},
      expiresAt: new Date(Date.now() + expiresIn)
    });

    await session.save();

    // Log the login action
    await logAdminAction({
      adminId,
      adminUsername,
      action: 'ADMIN_LOGIN',
      targetType: 'system',
      description: `Admin ${adminUsername} logged in`,
      metadata: { sessionId: session._id },
      req
    });

    return session;
  } catch (error) {
    console.error('Error creating admin session:', error);
    return null;
  }
};

/**
 * End an admin session
 * @param {string} tokenHash - Hashed token
 * @param {string} reason - Reason for ending session
 */
export const endAdminSession = async (token, reason = 'logged_out') => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await AdminSession.findOne({ tokenHash, status: 'active' });
    
    if (session) {
      await session.endSession(reason);
      
      // Log the logout action
      await logAdminAction({
        adminId: session.adminId,
        adminUsername: session.adminUsername,
        action: 'ADMIN_LOGOUT',
        targetType: 'system',
        description: `Admin ${session.adminUsername} logged out`,
        metadata: { sessionId: session._id, reason }
      });
    }
    
    return session;
  } catch (error) {
    console.error('Error ending admin session:', error);
    return null;
  }
};

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         null;
};

/**
 * Parse user agent string
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};
  
  const result = {
    browser: null,
    os: null,
    device: 'desktop'
  };

  // Simple browser detection
  if (userAgent.includes('Chrome')) result.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) result.browser = 'Firefox';
  else if (userAgent.includes('Safari')) result.browser = 'Safari';
  else if (userAgent.includes('Edge')) result.browser = 'Edge';

  // Simple OS detection
  if (userAgent.includes('Windows')) result.os = 'Windows';
  else if (userAgent.includes('Mac')) result.os = 'macOS';
  else if (userAgent.includes('Linux')) result.os = 'Linux';
  else if (userAgent.includes('Android')) result.os = 'Android';
  else if (userAgent.includes('iOS')) result.os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile')) result.device = 'mobile';
  else if (userAgent.includes('Tablet')) result.device = 'tablet';

  return result;
};

export default {
  logAdminAction,
  createAdminSession,
  endAdminSession
};
