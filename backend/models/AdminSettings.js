import mongoose from 'mongoose';

/**
 * AdminSettings Model Schema
 * Stores platform-wide admin settings and configurations
 */
const adminSettingsSchema = new mongoose.Schema({
  // Setting key (unique identifier)
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true
  },
  
  // Setting value (can be any type)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Setting category
  category: {
    type: String,
    enum: ['general', 'security', 'notifications', 'games', 'users', 'scoring', 'appearance'],
    default: 'general'
  },
  
  // Description of the setting
  description: {
    type: String,
    default: ''
  },
  
  // Data type of the value
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    default: 'string'
  },
  
  // Whether this setting is editable via UI
  isEditable: {
    type: Boolean,
    default: true
  },
  
  // Whether this setting is visible in UI
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Last modified by (admin ID)
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Update timestamp on save
adminSettingsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Indexes
adminSettingsSchema.index({ key: 1 });
adminSettingsSchema.index({ category: 1 });

// Static method to get a setting value
adminSettingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set a setting value
adminSettingsSchema.statics.setValue = async function(key, value, adminId = null, options = {}) {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      lastModifiedBy: adminId,
      ...options
    },
    { upsert: true, new: true }
  );
  return setting;
};

// Static method to get all settings by category
adminSettingsSchema.statics.getByCategory = async function(category) {
  return await this.find({ category, isVisible: true });
};

export default mongoose.model('AdminSettings', adminSettingsSchema);
