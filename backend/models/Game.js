import mongoose from 'mongoose';

/**
 * Game Model Schema
 * Represents a mini-game available on the platform
 */
const gameSchema = new mongoose.Schema({
  // Game's unique name/title
  name: {
    type: String,
    required: [true, 'Game name is required'],
    unique: true,
    trim: true
  },
  
  // Detailed description of the game
  description: {
    type: String,
    required: [true, 'Game description is required']
  },
  
  // Game difficulty level
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    },
    required: [true, 'Difficulty is required']
  },
  
  // Game category/type
  type: {
    type: String,
    enum: {
      values: ['speed', 'logic', 'puzzle', 'memory', 'reflex'],
      message: 'Type must be speed, logic, puzzle, memory, or reflex'
    },
    required: [true, 'Game type is required']
  },
  
  // Popularity counter (incremented each time someone plays)
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamps
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
gameSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Database Indexes for Performance
gameSchema.index({ type: 1 });          // Filter by type
gameSchema.index({ difficulty: 1 });    // Filter by difficulty
gameSchema.index({ popularity: -1 });   // Sort by popularity
gameSchema.index({ createdAt: -1 });    // Sort by newest

export default mongoose.model('Game', gameSchema);
