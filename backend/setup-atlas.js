#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Helper
 * This script helps verify your Atlas connection and setup
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log(chalk.blue('🚀 MongoDB Atlas Setup Helper\n'));

// Check if connection string is still template
if (!MONGODB_URI || MONGODB_URI.includes('YOUR_USERNAME') || MONGODB_URI.includes('YOUR_PASSWORD')) {
    console.log(chalk.red('❌ Connection string not configured!'));
    console.log(chalk.yellow('\n📝 Please update your backend/.env file with your actual MongoDB Atlas credentials:'));
    console.log(chalk.gray('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-games-platform?retryWrites=true&w=majority'));
    console.log(chalk.yellow('\n📖 See ATLAS_CONFIGURATION_STEPS.md for detailed instructions'));
    process.exit(1);
}

console.log(chalk.blue('🔍 Testing MongoDB Atlas connection...'));
console.log(chalk.gray(`   URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`));

async function testConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        
        console.log(chalk.green('\n✅ Successfully connected to MongoDB Atlas!'));
        
        // Get connection info
        const db = mongoose.connection.db;
        const admin = db.admin();
        const info = await admin.serverStatus();
        
        console.log(chalk.blue('\n📊 Connection Details:'));
        console.log(chalk.gray(`   Host: ${info.host}`));
        console.log(chalk.gray(`   Version: ${info.version}`));
        console.log(chalk.gray(`   Database: ${db.databaseName}`));
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(chalk.blue(`\n📁 Collections (${collections.length}):`));
        
        if (collections.length === 0) {
            console.log(chalk.yellow('   No collections found - database is empty'));
            console.log(chalk.yellow('   Run "npm run seed" to populate with initial data'));
        } else {
            for (const collection of collections) {
                const count = await db.collection(collection.name).countDocuments();
                console.log(chalk.gray(`   - ${collection.name} (${count} documents)`));
            }
        }
        
        console.log(chalk.green('\n🎉 MongoDB Atlas is ready to use!'));
        console.log(chalk.blue('\n📝 Next steps:'));
        console.log(chalk.gray('   1. Run "npm run seed" to populate database (if empty)'));
        console.log(chalk.gray('   2. Run "npm start" to start the backend server'));
        console.log(chalk.gray('   3. Run "npm run dev" in frontend folder to start frontend'));
        
    } catch (error) {
        console.log(chalk.red('\n❌ Connection failed!'));
        console.log(chalk.red(`   Error: ${error.message}`));
        
        // Provide specific help based on error type
        if (error.message.includes('authentication failed')) {
            console.log(chalk.yellow('\n🔧 Authentication Error Solutions:'));
            console.log(chalk.gray('   - Check your username and password in the connection string'));
            console.log(chalk.gray('   - Ensure the database user has "Read and write to any database" privileges'));
            console.log(chalk.gray('   - URL encode special characters in password (@→%40, #→%23, etc.)'));
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
            console.log(chalk.yellow('\n🔧 Network Error Solutions:'));
            console.log(chalk.gray('   - Check your internet connection'));
            console.log(chalk.gray('   - Verify your IP is whitelisted in MongoDB Atlas Network Access'));
            console.log(chalk.gray('   - Try adding 0.0.0.0/0 to allow access from anywhere (development only)'));
        } else if (error.message.includes('timeout')) {
            console.log(chalk.yellow('\n🔧 Timeout Error Solutions:'));
            console.log(chalk.gray('   - Check your internet connection'));
            console.log(chalk.gray('   - Try a different network or restart your router'));
            console.log(chalk.gray('   - Verify the cluster is running in MongoDB Atlas'));
        }
        
        console.log(chalk.yellow('\n📖 For detailed setup instructions, see:'));
        console.log(chalk.gray('   - ATLAS_CONFIGURATION_STEPS.md'));
        console.log(chalk.gray('   - MONGODB_ATLAS_SETUP.md'));
        
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

testConnection();