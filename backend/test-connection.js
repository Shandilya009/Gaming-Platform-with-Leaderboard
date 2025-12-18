import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...\n');
    
    // Check if MONGODB_URI is configured
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI is not set in .env file');
      console.log('\n📝 Please update your .env file with MongoDB Atlas connection string');
      console.log('See MONGODB_ATLAS_SETUP.md for detailed instructions\n');
      process.exit(1);
    }

    // Check if using placeholder values
    if (process.env.MONGODB_URI.includes('<username>') || 
        process.env.MONGODB_URI.includes('<password>') ||
        process.env.MONGODB_URI.includes('<cluster-name>')) {
      console.error('❌ ERROR: Please replace placeholder values in MONGODB_URI');
      console.log('\nYour connection string has placeholder values like:');
      console.log('  <username>, <password>, or <cluster-name>\n');
      console.log('📝 Follow these steps:');
      console.log('  1. Open backend/.env file');
      console.log('  2. Replace <username> with your MongoDB username');
      console.log('  3. Replace <password> with your MongoDB password');
      console.log('  4. Replace <cluster-name> with your cluster name\n');
      console.log('See MONGODB_ATLAS_SETUP.md for detailed instructions\n');
      process.exit(1);
    }

    // Attempt connection
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Successfully connected to MongoDB Atlas!\n');
    console.log('📊 Connection Details:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Port: ${mongoose.connection.port || 'N/A (using SRV)'}`);
    console.log(`   Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown'}\n`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections in database (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   (No collections yet - run "npm run seed" to populate database)\n');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      console.log();
    }

    console.log('🎉 Your MongoDB Atlas connection is working perfectly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run seed" to populate your database');
    console.log('   2. Run "npm start" to start the backend server\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed!\n');
    
    if (error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication Error:');
      console.error('   Your username or password is incorrect.\n');
      console.error('📝 To fix this:');
      console.error('   1. Go to MongoDB Atlas → Database Access');
      console.error('   2. Verify your database user credentials');
      console.error('   3. Update the MONGODB_URI in backend/.env file');
      console.error('   4. If password has special characters (@, #, %, etc.), encode them:');
      console.error('      @ becomes %40, # becomes %23, % becomes %25\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('🌐 Network/DNS Error:');
      console.error('   Cannot reach MongoDB Atlas cluster.\n');
      console.error('📝 To fix this:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the cluster name in your connection string');
      console.error('   3. Go to MongoDB Atlas → Network Access');
      console.error('   4. Add your IP address or allow access from anywhere (0.0.0.0/0)\n');
    } else if (error.message.includes('connection timed out')) {
      console.error('⏱️  Connection Timeout:');
      console.error('   Unable to establish connection in time.\n');
      console.error('📝 To fix this:');
      console.error('   1. Go to MongoDB Atlas → Network Access');
      console.error('   2. Make sure your IP is whitelisted');
      console.error('   3. Try "Allow Access from Anywhere" (0.0.0.0/0) for development\n');
    } else {
      console.error('📋 Error Details:');
      console.error(`   ${error.message}\n`);
    }
    
    console.error('📖 For detailed setup instructions, see: MONGODB_ATLAS_SETUP.md\n');
    process.exit(1);
  }
};

testConnection();
