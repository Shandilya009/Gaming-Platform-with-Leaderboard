import mongoose from 'mongoose';

/**
 * Game Model Schema
 * Represents a mini-game available on the platform
 */
const gameSchema = new mongoose.Schema({
  // Game's unique name/title
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Detailed description of the game and how to play
  description: {
    type: String,
    required: true
  },
  
  // Game difficulty level (affects scoring and user filtering)
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  
  // Game category/type (helps with filtering and organization)
  type: {
    type: String,
    enum: ['speed', 'logic', 'puzzle', 'memory', 'reflex'],
    required: true
  },
  
  // Popularity counter (incremented each time someone plays)
  popularity: {
    type: Number,
    default: 0
  },
  
  // Game creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Game model
export default mongoose.model('Game', gameSchema);
