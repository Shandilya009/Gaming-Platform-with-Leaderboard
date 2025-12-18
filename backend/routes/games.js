import express from 'express';
import Game from '../models/Game.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to build database filter from query parameters
 * @param {Object} query - Request query parameters
 * @returns {Object} - MongoDB filter object
 */
const buildGameFilter = (query) => {
  const filter = {};
  
  // Filter by difficulty level (easy, medium, hard)
  if (query.difficulty) {
    filter.difficulty = query.difficulty;
  }
  
  // Filter by game type (speed, logic, puzzle, memory, reflex)
  if (query.type) {
    filter.type = query.type;
  }
  
  return filter;
};

/**
 * Helper function to build sort options from query parameters
 * @param {string} sortParam - Sort parameter from query
 * @returns {Object} - MongoDB sort object
 */
const buildSortOptions = (sortParam) => {
  switch (sortParam) {
    case 'popularity':
      return { popularity: -1 }; // Most popular first
    case 'newest':
      return { createdAt: -1 };  // Newest first
    default:
      return { name: 1 };        // Alphabetical by default
  }
};

/**
 * GET /games
 * Retrieve all games with optional filtering and sorting
 * 
 * Query parameters:
 * - difficulty: Filter by difficulty (easy/medium/hard)
 * - type: Filter by type (speed/logic/puzzle/memory/reflex)
 * - sort: Sort order (popularity/newest/default=alphabetical)
 */
router.get('/', async (req, res) => {
  try {
    // Build filter and sort options from query parameters
    const filter = buildGameFilter(req.query);
    const sortOptions = buildSortOptions(req.query.sort);

    // Fetch games from database with applied filters and sorting
    const games = await Game.find(filter).sort(sortOptions);
    
    res.json(games);
    
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ 
      message: 'Server error while fetching games', 
      error: error.message 
    });
  }
});

/**
 * GET /games/:id
 * Retrieve a specific game by its ID
 * 
 * Parameters:
 * - id: Game's MongoDB ObjectId
 */
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // Find game by ID
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }
    
    res.json(game);
    
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ 
      message: 'Server error while fetching game', 
      error: error.message 
    });
  }
});

/**
 * POST /games
 * Create a new game (requires authentication)
 * 
 * Request body: { name, description, difficulty, type }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, difficulty, type } = req.body;

    // Create new game instance
    const game = new Game({
      name,
      description,
      difficulty,
      type
    });

    // Save to database
    await game.save();
    
    res.status(201).json(game);
    
  } catch (error) {
    // Handle duplicate name error (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Game with this name already exists' 
      });
    }
    
    console.error('Error creating game:', error);
    res.status(500).json({ 
      message: 'Server error while creating game', 
      error: error.message 
    });
  }
});

/**
 * PUT /games/:id
 * Update an existing game (requires authentication)
 * 
 * Parameters:
 * - id: Game's MongoDB ObjectId
 * Request body: { name, description, difficulty, type }
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    const { name, description, difficulty, type } = req.body;

    // Update game and return the updated document
    const game = await Game.findByIdAndUpdate(
      gameId,
      { name, description, difficulty, type },
      { 
        new: true,        // Return updated document
        runValidators: true  // Run schema validation
      }
    );

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    res.json(game);
    
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ 
      message: 'Server error while updating game', 
      error: error.message 
    });
  }
});

/**
 * DELETE /games/:id
 * Delete a game (requires authentication)
 * 
 * Parameters:
 * - id: Game's MongoDB ObjectId
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // Find and delete the game
    const game = await Game.findByIdAndDelete(gameId);
    
    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    res.json({ 
      message: 'Game deleted successfully',
      deletedGame: game.name
    });
    
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ 
      message: 'Server error while deleting game', 
      error: error.message 
    });
  }
});

export default router;
