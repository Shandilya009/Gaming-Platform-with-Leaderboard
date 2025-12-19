// Import required dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import route handlers
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import scoreRoutes from "./routes/scores.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    "https://gamezone-hackhawks.vercel.app",
    "https://gaming-platform-with-leaderboard.vercel.app"
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Database Connection
console.log("🔍 Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// ============================================
// API Routes
// ============================================

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Mini Games Platform API is running",
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: "healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Authentication routes: /auth/register, /auth/login
app.use("/auth", authRoutes);

// Game management routes: /games
app.use("/games", gameRoutes);

// Score and leaderboard routes: /scores
app.use("/scores", scoreRoutes);

// Admin routes: /admin
app.use("/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
