import mongoose from 'mongoose';

/**
 * Score Model Schema
 * Represents a detailed score record when a user completes a game
 * Includes raw metrics and computed final score for transparency
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
  
  // Raw gameplay metrics
  speedScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  accuracyScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  consistencyScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Computed final score (weighted average)
  // Formula: (speedScore * 0.4) + (accuracyScore * 0.4) + (consistencyScore * 0.2)
  finalScore: {
    type: Number,
    required: true
  },
  
  // Legacy score field for backward compatibility
  score: {
    type: Number,
    required: true
  },
  
  // Time taken to complete the game (in seconds)
  timeTaken: {
    type: Number,
    default: 0
  },
  
  // Game difficulty at time of play
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  // When this score was achieved
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
scoreSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Database Indexes for Performance Optimization
 */
// Index for game-specific leaderboards (sorted by finalScore descending)
scoreSchema.index({ gameId: 1, finalScore: -1 });

// Index for user's score history (sorted by date descending)
scoreSchema.index({ userId: 1, createdAt: -1 });

// Index for global leaderboard queries
scoreSchema.index({ finalScore: -1 });

// Compound index for user's best score per game
scoreSchema.index({ userId: 1, gameId: 1, finalScore: -1 });

// Export the Score model
export default mongoose.model('Score', scoreSchema);