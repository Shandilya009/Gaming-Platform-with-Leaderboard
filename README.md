# Mini Games Platform

A fullstack CRUD-based game competition platform built with MongoDB, Express, React, and Node.js. Users can register, login, play mini-games, earn points, and compete on leaderboards.

## 🚀 Quick Start

**New to this project?** Check out the [Quick Start Guide (5 minutes)](./QUICKSTART.md)

**Setting up MongoDB Atlas?** See the [Complete MongoDB Atlas Setup Guide](./MONGODB_ATLAS_SETUP.md)

## Features

### Backend
- **Authentication**: JWT-based user registration and login
- **Game Management**: Full CRUD operations for games
- **Score System**: Submit scores and update user points
- **Leaderboards**: Global leaderboard and per-game leaderboards
- **Database**: MongoDB with Mongoose ODM

### Frontend
- **Modern UI**: Dark theme with gradient accents and smooth animations
- **Authentication**: Register/Login pages with protected routes
- **Dashboard**: Overview of user stats and quick navigation
- **Game List**: Browse games with filters (difficulty, type, popularity)
- **Mini-Games**:
  - Reaction Timer: Test your reflexes
  - Click Speed Test: Click as fast as you can
  - Math Quiz: Solve math problems against the clock
  - Number Guessing: Guess the number with hints
- **Leaderboards**: Global and per-game rankings

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS

### Frontend
- React 19
- React Router DOM
- Axios
- Vite
- CSS3 (Custom styling)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)

### MongoDB Atlas Setup

**📖 [Complete MongoDB Atlas Setup Guide](./MONGODB_ATLAS_SETUP.md)**

Quick steps:
1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Free tier)
3. Create a database user with read/write access
4. Whitelist your IP address (or allow access from anywhere for development)
5. Get your connection string
6. Update `backend/.env` with your connection string

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Open `backend/.env` file
   - Replace the `MONGODB_URI` with your MongoDB Atlas connection string:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/mini-games-platform?retryWrites=true&w=majority
     ```
   - Change the `JWT_SECRET` to a secure random string (at least 32 characters)

4. Seed the database with initial games:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Games
- `GET /games` - Get all games (with optional filters)
- `GET /games/:id` - Get single game
- `POST /games` - Create new game (protected)
- `PUT /games/:id` - Update game (protected)
- `DELETE /games/:id` - Delete game (protected)

### Scores
- `POST /scores` - Submit score (protected)
- `GET /scores/user` - Get user's scores (protected)
- `GET /scores/leaderboard/global` - Global leaderboard
- `GET /scores/game/:gameId` - Per-game leaderboard

## Database Schema

### User
- username (unique)
- email (unique)
- password (hashed)
- totalPoints
- createdAt

### Game
- name (unique)
- description
- difficulty (easy/medium/hard)
- type (reflex/puzzle/casual)
- popularity
- createdAt

### Score
- userId (ref to User)
- gameId (ref to Game)
- score
- createdAt

## Usage

1. **Register/Login**: Create an account or login
2. **Browse Games**: View available games with filters
3. **Play Games**: Click on a game to start playing
4. **Earn Points**: Complete games to earn points
5. **Check Leaderboards**: View your ranking globally or per-game
6. **Track Progress**: View your stats on the dashboard

## Game Scoring

- **Reaction Timer**: Max 1000 points, decreases with reaction time
- **Click Speed Test**: 10 points per click
- **Math Quiz**: 50 points per correct answer
- **Number Guessing**: Max 500 points, decreases with attempts

## License

MIT
