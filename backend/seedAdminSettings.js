import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminSettings from './models/AdminSettings.js';

dotenv.config();

const defaultSettings = [
  // General Settings
  {
    key: 'platform_name',
    value: 'Gaming Platform',
    category: 'general',
    description: 'Name of the gaming platform',
    dataType: 'string'
  },
  {
    key: 'maintenance_mode',
    value: false,
    category: 'general',
    description: 'Enable maintenance mode to block user access',
    dataType: 'boolean'
  },
  {
    key: 'max_users',
    value: 10000,
    category: 'general',
    description: 'Maximum number of users allowed',
    dataType: 'number'
  },
  
  // Security Settings
  {
    key: 'max_login_attempts',
    value: 5,
    category: 'security',
    description: 'Maximum login attempts before account lockout',
    dataType: 'number'
  },
  {
    key: 'session_timeout_hours',
    value: 168,
    category: 'security',
    description: 'Session timeout in hours (default 7 days)',
    dataType: 'number'
  },
  {
    key: 'require_email_verification',
    value: false,
    category: 'security',
    description: 'Require email verification for new accounts',
    dataType: 'boolean'
  },
  
  // Scoring Settings
  {
    key: 'speed_weight',
    value: 0.4,
    category: 'scoring',
    description: 'Weight for speed score in final calculation',
    dataType: 'number'
  },
  {
    key: 'accuracy_weight',
    value: 0.4,
    category: 'scoring',
    description: 'Weight for accuracy score in final calculation',
    dataType: 'number'
  },
  {
    key: 'consistency_weight',
    value: 0.2,
    category: 'scoring',
    description: 'Weight for consistency score in final calculation',
    dataType: 'number'
  },
  {
    key: 'easy_multiplier',
    value: 1.0,
    category: 'scoring',
    description: 'Score multiplier for easy difficulty',
    dataType: 'number'
  },
  {
    key: 'medium_multiplier',
    value: 1.5,
    category: 'scoring',
    description: 'Score multiplier for medium difficulty',
    dataType: 'number'
  },
  {
    key: 'hard_multiplier',
    value: 2.0,
    category: 'scoring',
    description: 'Score multiplier for hard difficulty',
    dataType: 'number'
  },
  
  // User Settings
  {
    key: 'allow_registration',
    value: true,
    category: 'users',
    description: 'Allow new user registrations',
    dataType: 'boolean'
  },
  {
    key: 'default_user_role',
    value: 'user',
    category: 'users',
    description: 'Default role for new users',
    dataType: 'string'
  },
  {
    key: 'min_username_length',
    value: 3,
    category: 'users',
    description: 'Minimum username length',
    dataType: 'number'
  },
  {
    key: 'min_password_length',
    value: 6,
    category: 'users',
    description: 'Minimum password length',
    dataType: 'number'
  },
  
  // Game Settings
  {
    key: 'max_games_per_day',
    value: 100,
    category: 'games',
    description: 'Maximum games a user can play per day (0 = unlimited)',
    dataType: 'number'
  },
  {
    key: 'leaderboard_size',
    value: 100,
    category: 'games',
    description: 'Number of entries to show in leaderboard',
    dataType: 'number'
  }
];

async function seedSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const setting of defaultSettings) {
      const existing = await AdminSettings.findOne({ key: setting.key });
      if (!existing) {
        await AdminSettings.create(setting);
        console.log(`Created setting: ${setting.key}`);
      } else {
        console.log(`Setting already exists: ${setting.key}`);
      }
    }

    console.log('Admin settings seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding settings:', error);
    process.exit(1);
  }
}

seedSettings();
