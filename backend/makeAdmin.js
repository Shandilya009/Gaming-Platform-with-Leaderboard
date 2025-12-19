/**
 * Make Admin Script
 * Promotes a user to admin role
 * 
 * Usage: node makeAdmin.js <email>
 * Example: node makeAdmin.js admin@example.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js admin@example.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      console.log('\nAvailable users:');
      const users = await User.find().select('username email role');
      users.forEach(u => {
        console.log(`  - ${u.username} (${u.email}) - ${u.role || 'user'}`);
      });
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  User "${user.username}" is already an admin`);
      process.exit(0);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully made "${user.username}" (${user.email}) an admin!`);
    console.log('\n📋 User details:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Total Points: ${user.totalPoints}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

makeAdmin();
