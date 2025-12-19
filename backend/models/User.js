import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model Schema
 * Represents a registered user in the gaming platform
 */
const userSchema = new mongoose.Schema({
  // User's unique display name (minimum 3 characters)
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    index: true
  },
  
  // User's email address (used for login)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    index: true
  },
  
  // User's password (hashed before storing)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Total points earned across all games
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // User role (user or admin)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active'
  },
  
  // Ban reason (if banned)
  banReason: {
    type: String,
    default: null
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

// Update timestamp on save and hash password
userSchema.pre('save', async function() {
  this.updatedAt = new Date();
  
  // Only hash password if modified
  if (!this.isModified('password')) return;
  
  // Hash password with salt rounds of 10
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Database Indexes for Performance
userSchema.index({ totalPoints: -1 });  // Global leaderboard sorting

export default mongoose.model('User', userSchema);
