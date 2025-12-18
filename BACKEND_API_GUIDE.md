# Backend API Testing Guide

## 🚀 Your Backend is Running at: http://localhost:5000

## 📋 Available API Endpoints

### 1. Health Check
- **URL**: `GET http://localhost:5000/`
- **Purpose**: Check if the API is running
- **Response**: 
```json
{
  "message": "Mini Games Platform API is running",
  "status": "healthy",
  "timestamp": "2024-12-16T..."
}
```

### 2. Authentication Endpoints

#### Register New User
- **URL**: `POST http://localhost:5000/auth/register`
- **Body**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "totalPoints": 0
  }
}
```

#### Login User
- **URL**: `POST http://localhost:5000/auth/login`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "totalPoints": 0
  }
}
```

### 3. Games Endpoints

#### Get All Games
- **URL**: `GET http://localhost:5000/games`
- **Query Parameters** (optional):
  - `difficulty`: easy, medium, hard
  - `type`: speed, logic, puzzle, memory, reflex
  - `sort`: popularity, newest, name
- **Example**: `GET http://localhost:5000/games?difficulty=easy&sort=popularity`

#### Get Single Game
- **URL**: `GET http://localhost:5000/games/:id`
- **Example**: `GET http://localhost:5000/games/675ff123456789abcdef1234`

#### Create Game (Requires Authentication)
- **URL**: `POST http://localhost:5000/games`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "New Game",
  "description": "A fun new game",
  "difficulty": "easy",
  "type": "puzzle"
}
```

### 4. Scores Endpoints

#### Submit Score (Requires Authentication)
- **URL**: `POST http://localhost:5000/scores`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "gameId": "675ff123456789abcdef1234",
  "score": 150
}
```

#### Get Global Leaderboard
- **URL**: `GET http://localhost:5000/scores/leaderboard/global`
- **Query Parameters**: `limit` (default: 100)

#### Get Game Leaderboard
- **URL**: `GET http://localhost:5000/scores/game/:gameId`
- **Example**: `GET http://localhost:5000/scores/game/675ff123456789abcdef1234`

#### Get User Scores (Requires Authentication)
- **URL**: `GET http://localhost:5000/scores/user`
- **Headers**: `Authorization: Bearer <token>`

## 🧪 How to Test the Backend

### Option 1: Using PowerShell (Windows)
```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:5000" -Method GET

# Register a new user
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/auth/register" -Method POST -Body $registerBody -ContentType "application/json"

# Get all games
Invoke-RestMethod -Uri "http://localhost:5000/games" -Method GET
```

### Option 2: Using Postman
1. Download Postman (free)
2. Import the endpoints above
3. Test each endpoint

### Option 3: Using Browser (for GET requests only)
- Health Check: http://localhost:5000
- Get Games: http://localhost:5000/games
- Global Leaderboard: http://localhost:5000/scores/leaderboard/global

## 🎮 Seeded Games Available

Your database has been seeded with these games:
1. **Reaction Timer** (reflex, easy)
2. **Click Speed Test** (speed, medium)
3. **Math Quiz** (logic, medium)
4. **Number Guessing** (puzzle, easy)
5. **Memory Grid Challenge** (memory, hard)

## 🔐 Authentication Flow

1. **Register** → Get token
2. **Login** → Get token
3. **Use token** in Authorization header for protected routes
4. **Submit scores** → Earn points
5. **View leaderboards** → See rankings

## 📊 Database Collections

Your MongoDB has these collections:
- `users` - User accounts
- `games` - Available games
- `scores` - Game scores and leaderboard data