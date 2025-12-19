/**
 * Database Seeding Script
 * Populates the database with initial game data
 * 
 * Usage: node seed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from './models/Game.js';

dotenv.config();

// Game data to seed
const games = [
  {
    name: "Typing Speed Test",
    description: "Test your typing speed and accuracy with random paragraphs. Type as fast as you can within the time limit!",
    type: "speed",
    difficulty: "medium",
    popularity: 0
  },
  {
    name: "Speed Math Challenge",
    description: "Solve math problems as fast as you can! Addition, subtraction, multiplication, and division await.",
    type: "logic",
    difficulty: "medium",
    popularity: 0
  },
  {
    name: "Word Unscramble",
    description: "Unscramble jumbled words before time runs out. Test your vocabulary and pattern recognition!",
    type: "puzzle",
    difficulty: "easy",
    popularity: 0
  },
  {
    name: "Memory Grid Challenge",
    description: "Remember and recreate patterns on a grid. Each round gets harder as more cells light up!",
    type: "memory",
    difficulty: "hard",
    popularity: 0
  },
  {
    name: "Reflex Bar Stopper",
    description: "Stop the moving bar at the center for maximum points. Test your reflexes and timing!",
    type: "reflex",
    difficulty: "medium",
    popularity: 0
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Check existing games
    const existingGames = await Game.find({});
    console.log(`\n📋 Found ${existingGames.length} existing games`);

    // Seed games
    console.log('\n🎮 Seeding games...');
    
    for (const gameData of games) {
      const existingGame = await Game.findOne({ name: gameData.name });
      
      if (existingGame) {
        console.log(`  ⏭️  "${gameData.name}" already exists, skipping...`);
      } else {
        const game = new Game(gameData);
        await game.save();
        console.log(`  ✅ Created: "${gameData.name}" (${gameData.type}, ${gameData.difficulty})`);
      }
    }

    // Final count
    const finalCount = await Game.countDocuments();
    console.log(`\n✅ Seeding complete! Total games: ${finalCount}`);

    // List all games
    console.log('\n📋 All games in database:');
    const allGames = await Game.find({}).sort({ name: 1 });
    allGames.forEach((game, index) => {
      console.log(`  ${index + 1}. ${game.name} (${game.type}, ${game.difficulty})`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeder
seedDatabase();
