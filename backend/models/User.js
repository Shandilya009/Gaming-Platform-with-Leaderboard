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
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  
  // User's email address (used for login, automatically converted to lowercase)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // User's password (will be hashed before storing, minimum 6 characters)
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Total points earned across all games (starts at 0)
  totalPoints: {
    type: Number,
    default: 0
  },
  
  // Account creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save middleware: Hash password before saving to database
 * Only hashes if password is new or modified to avoid double-hashing
 */
userSchema.pre('save', async function() {
  // Skip hashing if password hasn't been modified
  if (!this.isModified('password')) return;
  
  // Hash password with salt rounds of 10 (good balance of security and performance)
  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Instance method: Compare provided password with stored hash
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {boolean} - True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export default mongoose.model('User', userSchema);
