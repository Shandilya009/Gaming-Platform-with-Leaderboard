// Import required dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import route handlers
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import scoreRoutes from "./routes/scores.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Configure CORS (Cross-Origin Resource Sharing) to allow frontend connections
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server default port
      "http://localhost:5174", // Alternative Vite port
      "https://gamezone-hackhawks.vercel.app", // Production frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed request headers
    credentials: true, // Allow cookies and credentials
  })
);

// Parse JSON request bodies
app.use(express.json());

// Database Connection
// Connect to MongoDB using connection string from environment variables
console.log("🔍 Connecting to MongoDB...");
console.log("URI:", process.env.MONGODB_URI ? "✅ Found" : "❌ Missing");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    console.log("📊 Connection details:");
    console.log("  Host:", mongoose.connection.host);
    console.log("  Database:", mongoose.connection.name);
    console.log("  Port:", mongoose.connection.port);
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// API Routes Setup
// Authentication routes: /auth/register, /auth/login
app.use("/auth", authRoutes);

// Game management routes: /games (CRUD operations)
app.use("/games", gameRoutes);

// Score and leaderboard routes: /scores
app.use("/scores", scoreRoutes);

// Health Check Endpoint
// Simple endpoint to verify API is running
app.get("/", (req, res) => {
  res.json({
    message: "Mini Games Platform API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Start Server
// Default to port 5001 to avoid conflicts with macOS system services
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
});
