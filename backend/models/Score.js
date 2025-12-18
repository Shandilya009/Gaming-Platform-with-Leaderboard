import mongoose from 'mongoose';

/**
 * Score Model Schema
 * Represents a score record when a user completes a game
 */
const scoreSchema = new mongoose.Schema({
  // Reference to the user who achieved this score
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the game that was played
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  
  // The score/points earned in this game session
  score: {
    type: Number,
    required: true
  },
  
  // When this score was achieved
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Database Indexes for Performance Optimization
 * These indexes speed up common queries used in leaderboards
 */

// Index for game-specific leaderboards (sorted by score descending)
scoreSchema.index({ gameId: 1, score: -1 });

// Index for user's score history (sorted by date descending)
scoreSchema.index({ userId: 1, createdAt: -1 });

// Export the Score model
export default mongoose.model('Score', scoreSchema);
