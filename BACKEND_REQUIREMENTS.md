# Backend API Requirements Document

## Overview
Complete backend requirements for the Gaming Platform with Leaderboard frontend application.

---

## 🔧 Technology Stack Required

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

---

## 📊 Database Models

### 1. User Model
```javascript
{
  _id: ObjectId,
  username: String (required, unique, min: 3),
  email: String (required, unique, valid email),
  password: String (required, hashed, min: 6),
  totalPoints: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Game Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (required),
  type: String (enum: ['speed', 'logic', 'puzzle', 'memory', 'reflex']),
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  popularity: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Score Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  gameId: ObjectId (ref: 'Game', required),
  score: Number (required),
  speedScore: Number (0-100, default: 0),
  accuracyScore: Number (0-100, default: 0),
  consistencyScore: Number (0-100, default: 0),
  finalScore: Number (calculated),
  timeTaken: Number (seconds, default: 0),
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, min 3 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

**Response (201):**
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "_id": "user_id",
    "username": "username",
    "email": "email",
    "totalPoints": 0
  }
}
```

**Errors:**
- 400: Validation error (missing fields, invalid email, short password)
- 409: User already exists (email or username taken)

---

### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "_id": "user_id",
    "username": "username",
    "email": "email",
    "totalPoints": 150
  }
}
```

**Errors:**
- 400: Missing credentials
- 401: Invalid email or password

---

## 🎮 Games Endpoints

### GET /games
Get all games with optional filtering and sorting.

**Query Parameters:**
- `difficulty` (optional): 'easy' | 'medium' | 'hard'
- `type` (optional): 'speed' | 'logic' | 'puzzle' | 'memory' | 'reflex'
- `sort` (optional): 'popularity' | 'newest' | 'name'

**Response (200):**
```json
[
  {
    "_id": "game_id",
    "name": "Typing Speed Test",
    "description": "Test your typing speed and accuracy",
    "type": "speed",
    "difficulty": "medium",
    "popularity": 150,
    "createdAt": "2025-12-19T00:00:00.000Z"
  }
]
```

---

### GET /games/:id
Get a specific game by ID.

**Response (200):**
```json
{
  "_id": "game_id",
  "name": "Typing Speed Test",
  "description": "Test your typing speed and accuracy",
  "type": "speed",
  "difficulty": "medium",
  "popularity": 150
}
```

**Errors:**
- 404: Game not found

---

### POST /games (Admin Only)
Create a new game.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "type": "string (required)",
  "difficulty": "string (required)"
}
```

---

### PUT /games/:id (Admin Only)
Update an existing game.

---

### DELETE /games/:id (Admin Only)
Delete a game.

---

## 📈 Scores Endpoints

### POST /scores
Submit a score for a completed game. **Requires Authentication.**

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Request Body (Enhanced Format):**
```json
{
  "gameId": "string (required)",
  "score": "number (required)",
  "speedScore": "number (0-100, optional)",
  "accuracyScore": "number (0-100, optional)",
  "consistencyScore": "number (0-100, optional)",
  "timeTaken": "number (seconds, optional)",
  "difficulty": "string (optional)"
}
```

**Request Body (Legacy Format):**
```json
{
  "gameId": "string (required)",
  "score": "number (required)"
}
```

**Response (201):**
```json
{
  "message": "Score submitted successfully",
  "score": {
    "_id": "score_id",
    "userId": "user_id",
    "gameId": "game_id",
    "score": 85,
    "speedScore": 80,
    "accuracyScore": 90,
    "consistencyScore": 70,
    "finalScore": 82,
    "timeTaken": 30,
    "difficulty": "medium",
    "createdAt": "2025-12-19T00:00:00.000Z"
  },
  "breakdown": {
    "speed": { "value": 80, "weight": 40, "contribution": 32 },
    "accuracy": { "value": 90, "weight": 40, "contribution": 36 },
    "consistency": { "value": 70, "weight": 20, "contribution": 14 }
  },
  "pointsEarned": 82
}
```

**Backend Logic:**
1. Validate game exists
2. Calculate finalScore: `(speedScore * 0.4) + (accuracyScore * 0.4) + (consistencyScore * 0.2)`
3. Apply difficulty multiplier: easy=1.0, medium=1.25, hard=1.5
4. Save score to database
5. Update user's totalPoints
6. Increment game's popularity

---

### GET /scores/user
Get all scores for the authenticated user. **Requires Authentication.**

**Response (200):**
```json
{
  "scores": [
    {
      "_id": "score_id",
      "userId": "user_id",
      "gameId": {
        "_id": "game_id",
        "name": "Typing Speed Test",
        "type": "speed",
        "difficulty": "medium"
      },
      "score": 85,
      "finalScore": 82,
      "speedScore": 80,
      "accuracyScore": 90,
      "consistencyScore": 70,
      "createdAt": "2025-12-19T00:00:00.000Z"
    }
  ],
  "stats": {
    "gamesPlayed": 10,
    "averageScore": 75,
    "bestScore": 95,
    "totalPoints": 750,
    "avgSpeed": 78,
    "avgAccuracy": 82,
    "avgConsistency": 70
  },
  "skillImpact": {
    "focus": 76,
    "reflex": 78,
    "accuracy": 82,
    "consistency": 70
  }
}
```

**Note:** Scores should be sorted by `createdAt` descending (newest first) and populated with game details.

---

### GET /scores/user/analytics
Get detailed analytics for the authenticated user. **Requires Authentication.**

**Response (200):**
```json
{
  "totalGames": 10,
  "bestScore": {
    "score": 95,
    "game": "Typing Speed Test",
    "date": "2025-12-19T00:00:00.000Z",
    "breakdown": {
      "speed": { "value": 90, "weight": 40, "contribution": 36 },
      "accuracy": { "value": 95, "weight": 40, "contribution": 38 },
      "consistency": { "value": 85, "weight": 20, "contribution": 17 }
    }
  },
  "averageScore": 75,
  "recentScores": [/* Last 5 scores with game details */],
  "skillImpact": {
    "focus": 76,
    "reflex": 78,
    "accuracy": 82,
    "consistency": 70
  },
  "progressData": [
    { "date": "2025-12-19", "score": 85, "game": "Typing Speed Test" }
  ],
  "gameBreakdown": [
    {
      "name": "Typing Speed Test",
      "type": "speed",
      "plays": 5,
      "totalScore": 400,
      "bestScore": 95
    }
  ],
  "globalRank": 5,
  "stats": {
    "gamesPlayed": 10,
    "averageScore": 75,
    "bestScore": 95,
    "totalPoints": 750,
    "avgSpeed": 78,
    "avgAccuracy": 82,
    "avgConsistency": 70
  }
}
```

---

### GET /scores/user/rank
Get user's current global rank. **Requires Authentication.**

**Response (200):**
```json
{
  "rank": 5,
  "totalPoints": 750,
  "pointsToNextRank": 50,
  "nextRankPoints": 800
}
```

**Backend Logic:**
1. Get current user's totalPoints
2. Count users with more totalPoints than current user
3. Rank = count + 1
4. Find next user above current user to calculate pointsToNextRank

---

### GET /scores/game/:gameId
Get leaderboard for a specific game.

**Query Parameters:**
- `limit` (optional): Number of results (default: 100, max: 1000)

**Response (200):**
```json
[
  {
    "_id": "score_id",
    "userId": {
      "_id": "user_id",
      "username": "player1"
    },
    "gameId": {
      "_id": "game_id",
      "name": "Typing Speed Test"
    },
    "finalScore": 95,
    "score": 95,
    "createdAt": "2025-12-19T00:00:00.000Z"
  }
]
```

**Note:** Sort by `finalScore` descending.

---

### GET /scores/leaderboard/global
Get global leaderboard (all users by total points).

**Query Parameters:**
- `limit` (optional): Number of results (default: 100, max: 1000)

**Response (200):**
```json
[
  {
    "_id": "user_id",
    "username": "player1",
    "totalPoints": 1500,
    "createdAt": "2025-12-01T00:00:00.000Z"
  },
  {
    "_id": "user_id",
    "username": "player2",
    "totalPoints": 1200,
    "createdAt": "2025-12-05T00:00:00.000Z"
  }
]
```

**Note:** Sort by `totalPoints` descending.

---

## 🔒 Middleware Requirements

### Authentication Middleware
```javascript
// Verify JWT token from Authorization header
// Extract userId and attach to req.userId
// Return 401 if token is invalid or expired
```

**Protected Routes:**
- POST /scores
- GET /scores/user
- GET /scores/user/analytics
- GET /scores/user/rank

---

## 📐 Score Calculation Formula

```javascript
// Weights
const SCORE_WEIGHTS = {
  speed: 0.4,      // 40%
  accuracy: 0.4,   // 40%
  consistency: 0.2 // 20%
};

// Difficulty Multipliers
const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5
};

// Calculation
const weightedScore = 
  (speedScore * 0.4) + 
  (accuracyScore * 0.4) + 
  (consistencyScore * 0.2);

const finalScore = Math.round(weightedScore * difficultyMultiplier);
```

---

## 🗄️ Database Indexes

```javascript
// Score indexes for performance
scoreSchema.index({ gameId: 1, finalScore: -1 });  // Game leaderboards
scoreSchema.index({ userId: 1, createdAt: -1 });   // User score history
scoreSchema.index({ finalScore: -1 });              // Global rankings
scoreSchema.index({ userId: 1, gameId: 1, finalScore: -1 }); // User best per game

// User indexes
userSchema.index({ totalPoints: -1 });  // Global leaderboard
userSchema.index({ email: 1 });         // Login lookup
userSchema.index({ username: 1 });      // Username lookup

// Game indexes
gameSchema.index({ type: 1 });          // Filter by type
gameSchema.index({ difficulty: 1 });    // Filter by difficulty
gameSchema.index({ popularity: -1 });   // Sort by popularity
```

---

## 🌐 CORS Configuration

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',           // Local development
    'https://your-frontend.vercel.app' // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 📁 Recommended File Structure

```
backend/
├── index.js                 # Entry point, Express setup
├── package.json
├── .env                     # Environment variables
├── .env.example
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js
│   ├── Game.js
│   └── Score.js
├── routes/
│   ├── auth.js              # /auth endpoints
│   ├── games.js             # /games endpoints
│   └── scores.js            # /scores endpoints
├── utils/
│   └── scoreCalculator.js   # Score calculation logic
└── seed.js                  # Database seeding script
```

---

## 🔑 Environment Variables

```env
# Server
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/mini-games-platform
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mini-games-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

---

## 🎮 Seed Data (5 Games)

```javascript
const games = [
  {
    name: "Typing Speed Test",
    description: "Test your typing speed and accuracy with random paragraphs",
    type: "speed",
    difficulty: "medium",
    popularity: 0
  },
  {
    name: "Speed Math Challenge",
    description: "Solve math problems as fast as you can",
    type: "logic",
    difficulty: "medium",
    popularity: 0
  },
  {
    name: "Word Unscramble",
    description: "Unscramble words before time runs out",
    type: "puzzle",
    difficulty: "easy",
    popularity: 0
  },
  {
    name: "Memory Grid Challenge",
    description: "Remember and recreate patterns on a grid",
    type: "memory",
    difficulty: "hard",
    popularity: 0
  },
  {
    name: "Reflex Bar Stopper",
    description: "Stop the moving bar at the center for maximum points",
    type: "reflex",
    difficulty: "medium",
    popularity: 0
  }
];
```

---

## ✅ API Response Standards

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Server Error

---

## 🚀 Deployment Checklist

1. ✅ Set production MONGODB_URI (Atlas)
2. ✅ Set strong JWT_SECRET
3. ✅ Configure CORS for production frontend URL
4. ✅ Enable MongoDB indexes
5. ✅ Set up error logging
6. ✅ Configure rate limiting (optional)
7. ✅ Set up health check endpoint: GET /health
