import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from './models/Game.js';

dotenv.config();

const seedGames = [
  {
    name: 'Typing Speed Test',
    description: 'Type a random paragraph in 30 seconds. Score = WPM × accuracy%',
    difficulty: 'medium',
    type: 'speed',
    popularity: 0
  },
  {
    name: 'Speed Math Challenge',
    description: 'Solve as many math problems as possible in 60 seconds',
    difficulty: 'medium',
    type: 'logic',
    popularity: 0
  },
  {
    name: 'Word Unscramble',
    description: 'Unscramble words correctly in 60 seconds',
    difficulty: 'easy',
    type: 'puzzle',
    popularity: 0
  },
  {
    name: 'Memory Grid Challenge',
    description: 'Remember and click the highlighted blocks in a 4×4 grid',
    difficulty: 'hard',
    type: 'memory',
    popularity: 0
  },
  {
    name: 'Reflex Bar Stopper',
    description: 'Stop the moving bar at the center. Score based on accuracy',
    difficulty: 'easy',
    type: 'reflex',
    popularity: 0
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing games');

    // Insert seed games
    await Game.insertMany(seedGames);
    console.log('Seed games inserted successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
