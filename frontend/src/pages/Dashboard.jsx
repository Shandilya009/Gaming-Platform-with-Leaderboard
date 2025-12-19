import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { scoresAPI, gamesAPI } from "../api/api";
import "./Dashboard.css";

/**
 * Dashboard Component - Interactive Real-Time Dashboard
 */
function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [recentScores, setRecentScores] = useState([]);
  const [games, setGames] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    rank: "-",
    totalPlayers: 0,
  });
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load data on mount and when window gains focus (user returns from game)
  const loadDashboardData = useCallback(async () => {
    try {
      const [scoresResponse, gamesResponse, rankResponse, leaderboardResponse] = await Promise.all([
        scoresAPI.getUserScores(),
        gamesAPI.getAll(),
        scoresAPI.getUserRank().catch(() => ({ data: { rank: "-" } })),
        scoresAPI.getGlobalLeaderboard(5).catch(() => ({ data: [] }))
      ]);

      const userScores = scoresResponse.data?.scores || scoresResponse.data || [];
      setRecentScores(userScores.slice(0, 5));
      setGames(gamesResponse.data);
      setTopPlayers(leaderboardResponse.data || []);
      
      // Calculate weekly chart data from actual scores
      calculateWeeklyData(userScores);
      
      // Get total players count from leaderboard for context
      const totalPlayersResponse = await scoresAPI.getGlobalLeaderboard(1000).catch(() => ({ data: [] }));
      const totalPlayers = totalPlayersResponse.data?.length || 0;
      calculateUserStats(userScores, rankResponse.data?.rank, totalPlayers);
      setLastUpdated(new Date());
      
      // Refresh user data to get updated points
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh when window gains focus (user returns from playing a game)
    const handleFocus = () => {
      loadDashboardData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDashboardData]);

  // Calculate weekly performance data from actual scores
  const calculateWeeklyData = (scores) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Find scores for this day
      const dayScores = scores.filter(s => {
        const scoreDate = new Date(s.createdAt);
        return scoreDate.toDateString() === date.toDateString();
      });
      
      const totalPoints = dayScores.reduce((sum, s) => sum + (s.finalScore || s.score || 0), 0);
      weekData.push({ day: dayName, score: totalPoints, count: dayScores.length });
    }
    
    setWeeklyData(weekData);
  };

  const calculateUserStats = (userScores, rank, totalPlayers = 0) => {
    if (!userScores || userScores.length === 0) {
      setStats({ gamesPlayed: 0, averageScore: 0, bestScore: 0, rank: rank || "-", totalPlayers });
      return;
    }

    const scoreValues = userScores.map((s) => s.finalScore || s.score || 0);
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / scoreValues.length);
    const bestScore = Math.max(...scoreValues);

    setStats({
      gamesPlayed: userScores.length,
      averageScore,
      bestScore,
      rank: rank || "-",
      totalPlayers,
    });
  };

  const getGameTypeColor = (gameType) => {
    const colors = {
      speed: "#FF6B35",
      logic: "#8B5CF6",
      puzzle: "#10B981",
      memory: "#F59E0B",
      reflex: "#EF4444",
    };
    return colors[gameType] || "#6366F1";
  };

  // Get max score for chart scaling
  const maxWeeklyScore = Math.max(...weeklyData.map(d => d.score), 1);

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
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🎮</span>
            {sidebarOpen && <span className="logo-text">GameZone</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

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
          {user.role === 'admin' && (
            <>
              <div className="nav-divider"></div>
              <Link to="/admin" className="nav-item nav-item-admin">
                <span className="nav-icon">⚙️</span>
                {sidebarOpen && <span className="nav-text">Admin Panel</span>}
              </Link>
            </>
          )}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-section">
              <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
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
            <button className="logout-button-collapsed" onClick={handleLogout} title="Logout">🚪</button>
          </div>
        )}
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user.username}! 🎮</h1>
            <p className="header-subtitle">Here's your gaming performance overview</p>
          </div>
          <div className="header-actions">
            <button className="btn-refresh" onClick={loadDashboardData} title="Refresh data">
              🔄
            </button>
            <Link to="/games" className="btn-play-now">Play Now</Link>
            <button className="btn-logout" onClick={handleLogout} style={{ marginLeft: "12px" }}>
              Logout
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">{stats.gamesPlayed}</div>
              <div className="stat-trend neutral">Total games</div>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-label">Total Points</div>
              <div className="stat-value">{user.totalPoints}</div>
              <div className="stat-trend positive">Best: {stats.bestScore}</div>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{stats.averageScore}</div>
              <div className="stat-trend neutral">Per game</div>
            </div>
          </div>

          <Link to="/leaderboard" className="stat-card stat-card-purple stat-card-clickable">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Global Rank</div>
              <div className="stat-value">#{stats.rank}</div>
              <div className="stat-trend positive">
                {stats.totalPlayers > 0 ? `of ${stats.totalPlayers} players` : "View Leaderboard →"}
              </div>
            </div>
          </Link>
        </div>

        <div className="content-grid">
          <div className="chart-card">
            <div className="card-header">
              <h3>Performance Overview</h3>
              <span className="last-updated">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <div className="chart-container">
              <div className="bar-chart">
                {weeklyData.map((day, index) => (
                  <div 
                    key={index}
                    className="chart-bar" 
                    style={{ 
                      height: day.score > 0 ? `${Math.max(10, (day.score / maxWeeklyScore) * 100)}%` : '5%',
                      opacity: day.score > 0 ? 1 : 0.3
                    }}
                    title={`${day.day}: ${day.score} pts (${day.count} games)`}
                  >
                    <span className="bar-value">{day.score > 0 ? day.score : '-'}</span>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {weeklyData.map((day, index) => (
                  <span key={index}>{day.day}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="activity-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Link to="/my-scores" className="view-all-link">View All →</Link>
            </div>
            <div className="activity-list">
              {recentScores.length > 0 ? (
                recentScores.map((score, index) => (
                  <div key={score._id} className="activity-item">
                    <div
                      className="activity-icon"
                      style={{
                        background: `linear-gradient(135deg, ${getGameTypeColor(score.gameId?.type)}, ${getGameTypeColor(score.gameId?.type)}dd)`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{score.gameId?.name || "Game"}</div>
                      <div className="activity-time">
                        {new Date(score.createdAt).toLocaleDateString()} {new Date(score.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="activity-score">{score.finalScore || score.score} pts</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🎮</span>
                  <p>No games played yet. Start playing!</p>
                  <Link to="/games" className="btn-play-small">Play Now</Link>
                </div>
              )}
            </div>
          </div>

          <div className="categories-card">
            <div className="card-header">
              <h3>Game Categories</h3>
            </div>
            <div className="categories-grid">
              <Link to="/games?type=speed" className="category-item" style={{ borderColor: "#FF6B35" }}>
                <div className="category-icon">⚡</div>
                <div className="category-name">Speed</div>
                <div className="category-count">{games.filter((g) => g.type === "speed").length} games</div>
              </Link>
              <Link to="/games?type=logic" className="category-item" style={{ borderColor: "#8B5CF6" }}>
                <div className="category-icon">🧠</div>
                <div className="category-name">Logic</div>
                <div className="category-count">{games.filter((g) => g.type === "logic").length} games</div>
              </Link>
              <Link to="/games?type=puzzle" className="category-item" style={{ borderColor: "#10B981" }}>
                <div className="category-icon">🧩</div>
                <div className="category-name">Puzzle</div>
                <div className="category-count">{games.filter((g) => g.type === "puzzle").length} games</div>
              </Link>
              <Link to="/games?type=reflex" className="category-item" style={{ borderColor: "#EF4444" }}>
                <div className="category-icon">🎯</div>
                <div className="category-name">Reflex</div>
                <div className="category-count">{games.filter((g) => g.type === "reflex").length} games</div>
              </Link>
            </div>
          </div>

          <div className="leaderboard-preview-card">
            <div className="card-header">
              <h3>🏆 Top Players</h3>
              <Link to="/leaderboard" className="view-all-link">View All →</Link>
            </div>
            <div className="leaderboard-preview-list">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div 
                    key={player._id} 
                    className={`leaderboard-preview-item ${player.username === user?.username ? 'current-user' : ''}`}
                  >
                    <div className="leaderboard-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="leaderboard-player">
                      <span className="player-name">{player.username}</span>
                      {player.username === user?.username && <span className="you-tag">YOU</span>}
                    </div>
                    <div className="leaderboard-points">{player.totalPoints.toLocaleString()} pts</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No players yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

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
