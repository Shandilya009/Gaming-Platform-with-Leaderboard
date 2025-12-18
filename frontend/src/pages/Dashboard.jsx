import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { scoresAPI, gamesAPI } from "../api/api";
import "./Dashboard.css";

/**
 * Dashboard Component
 *
 * Main user dashboard showing:
 * - User statistics and performance metrics
 * - Recent game activity
 * - Quick navigation to games and leaderboards
 * - Performance charts and analytics
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Component state
  const [recentScores, setRecentScores] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    rank: "-",
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load dashboard data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Fetch all dashboard data from API
   * Loads user scores and games list, then calculates statistics
   */
  const loadDashboardData = async () => {
    try {
      // Fetch user scores and games list simultaneously for better performance
      const [scoresResponse, gamesResponse] = await Promise.all([
        scoresAPI.getUserScores(),
        gamesAPI.getAll(),
      ]);

      const userScores = scoresResponse.data;

      // Set recent scores (limit to 5 most recent)
      setRecentScores(userScores.slice(0, 5));
      setGames(gamesResponse.data);

      // Calculate user statistics from scores
      calculateUserStats(userScores);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate user statistics from their score history
   * @param {Array} userScores - Array of user's game scores
   */
  const calculateUserStats = (userScores) => {
    if (userScores.length === 0) {
      return; // Keep default stats if no scores
    }

    // Extract score values for calculations
    const scoreValues = userScores.map((scoreRecord) => scoreRecord.score);

    // Calculate average score
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / scoreValues.length);

    // Find best (highest) score
    const bestScore = Math.max(...scoreValues);

    // Update stats state
    setStats({
      gamesPlayed: userScores.length,
      averageScore: averageScore,
      bestScore: bestScore,
      rank: "-", // TODO: Calculate actual rank from global leaderboard
    });
  };

  /**
   * Get color for game type badges and icons
   * @param {string} gameType - Type of game (speed, logic, puzzle, etc.)
   * @returns {string} - Hex color code
   */
  const getGameTypeColor = (gameType) => {
    const gameTypeColors = {
      speed: "#FF6B35", // Orange for speed games
      logic: "#8B5CF6", // Purple for logic games
      puzzle: "#10B981", // Green for puzzle games
      memory: "#F59E0B", // Yellow for memory games
      reflex: "#EF4444", // Red for reflex games
    };

    return gameTypeColors[gameType] || "#6366F1"; // Default blue if type not found
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* Sidebar Header with Logo and Toggle */}
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🎮</span>
            {sidebarOpen && <span className="logo-text">GameZone</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>
          <Link to="/games" className="nav-item">
            <span className="nav-icon">🎯</span>
            {sidebarOpen && <span className="nav-text">Games</span>}
          </Link>
          <Link to="/leaderboard" className="nav-item">
            <span className="nav-icon">🏆</span>
            {sidebarOpen && <span className="nav-text">Leaderboard</span>}
          </Link>
          <Link to="/my-scores" className="nav-item">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">My Scores</span>}
          </Link>
        </nav>

        {/* User Profile Section (only shown when sidebar is open) */}
        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-section">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-points">{user.totalPoints} pts</div>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}

        {!sidebarOpen && (
          <div className="sidebar-logout-collapsed">
            <button className="logout-button-collapsed" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        )}
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Dashboard Header with Welcome Message */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user.username}! 🎮</h1>
            <p className="header-subtitle">
              Here's your gaming performance overview
            </p>
          </div>
          <div className="header-actions">
            <Link to="/games" className="btn-play-now">
              Play Now
            </Link>
            <button
              className="btn-logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{ marginLeft: "12px" }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards Grid - Shows key metrics */}
        <div className="stats-grid">
          {/* Games Played Counter */}
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">{stats.gamesPlayed}</div>
              <div className="stat-trend positive">+12% this week</div>
            </div>
          </div>

          {/* Total Points Earned */}
          <div className="stat-card stat-card-success">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-label">Total Points</div>
              <div className="stat-value">{user.totalPoints}</div>
              <div className="stat-trend positive">+{stats.bestScore} best</div>
            </div>
          </div>

          {/* Average Score Per Game */}
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{stats.averageScore}</div>
              <div className="stat-trend neutral">Per game</div>
            </div>
          </div>

          {/* Global Ranking */}
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Global Rank</div>
              <div className="stat-value">#{stats.rank}</div>
              <div className="stat-trend positive">Top player</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid - Charts and Activity */}
        <div className="content-grid">
          {/* Performance Chart - Shows weekly performance */}
          <div className="chart-card">
            <div className="card-header">
              <h3>Performance Overview</h3>
              <select className="chart-filter">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All time</option>
              </select>
            </div>
            <div className="chart-container">
              {/* Simple bar chart showing daily scores */}
              <div className="bar-chart">
                <div className="chart-bar" style={{ height: "70%" }}>
                  <span className="bar-value">280</span>
                </div>
                <div className="chart-bar" style={{ height: "85%" }}>
                  <span className="bar-value">340</span>
                </div>
                <div className="chart-bar" style={{ height: "60%" }}>
                  <span className="bar-value">240</span>
                </div>
                <div className="chart-bar" style={{ height: "95%" }}>
                  <span className="bar-value">380</span>
                </div>
                <div className="chart-bar" style={{ height: "75%" }}>
                  <span className="bar-value">300</span>
                </div>
                <div className="chart-bar" style={{ height: "88%" }}>
                  <span className="bar-value">352</span>
                </div>
                <div className="chart-bar" style={{ height: "92%" }}>
                  <span className="bar-value">368</span>
                </div>
              </div>
              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Recent Activity - Shows last 5 games played */}
          <div className="activity-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Link to="/my-scores" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="activity-list">
              {recentScores.length > 0 ? (
                recentScores.map((score, index) => (
                  <div key={score._id} className="activity-item">
                    {/* Activity rank indicator with game type color */}
                    <div
                      className="activity-icon"
                      style={{
                        background: `linear-gradient(135deg, ${getGameTypeColor(
                          score.gameId?.type
                        )}, ${getGameTypeColor(score.gameId?.type)}dd)`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {score.gameId?.name || "Game"}
                      </div>
                      <div className="activity-time">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="activity-score">{score.score} pts</div>
                  </div>
                ))
              ) : (
                /* Empty state when no games have been played */
                <div className="empty-state">
                  <span className="empty-icon">🎮</span>
                  <p>No games played yet. Start playing!</p>
                </div>
              )}
            </div>
          </div>

          {/* Game Categories Overview */}
          <div className="categories-card">
            <div className="card-header">
              <h3>Game Categories</h3>
            </div>
            <div className="categories-grid">
              {/* Speed Games Category */}
              <div className="category-item" style={{ borderColor: "#FF6B35" }}>
                <div className="category-icon">⚡</div>
                <div className="category-name">Speed</div>
                <div className="category-count">
                  {games.filter((g) => g.type === "speed").length} games
                </div>
              </div>
              {/* Logic Games Category */}
              <div className="category-item" style={{ borderColor: "#8B5CF6" }}>
                <div className="category-icon">🧠</div>
                <div className="category-name">Logic</div>
                <div className="category-count">
                  {games.filter((g) => g.type === "logic").length} games
                </div>
              </div>
              {/* Puzzle Games Category */}
              <div className="category-item" style={{ borderColor: "#10B981" }}>
                <div className="category-icon">🧩</div>
                <div className="category-name">Puzzle</div>
                <div className="category-count">
                  {games.filter((g) => g.type === "puzzle").length} games
                </div>
              </div>
              {/* Reflex Games Category */}
              <div className="category-item" style={{ borderColor: "#EF4444" }}>
                <div className="category-icon">⚡</div>
                <div className="category-name">Reflex</div>
                <div className="category-count">
                  {games.filter((g) => g.type === "reflex").length} games
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="quick-actions-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-list">
              <Link to="/games" className="action-button action-primary">
                <span className="action-icon">🎮</span>
                <span className="action-text">Play Games</span>
              </Link>
              <Link to="/leaderboard" className="action-button action-success">
                <span className="action-icon">🏆</span>
                <span className="action-text">View Leaderboard</span>
              </Link>
              <Link to="/my-scores" className="action-button action-purple">
                <span className="action-icon">📊</span>
                <span className="action-text">My Statistics</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
