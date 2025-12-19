import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { scoresAPI } from "../api/api";
import "./MyScores.css";

/**
 * MyScores Component - Interactive Real-Time Analytics Dashboard
 */
function MyScores() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedGame, setSelectedGame] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadAnalytics = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [analyticsRes, rankRes] = await Promise.all([
        scoresAPI.getUserAnalytics(),
        scoresAPI.getUserRank()
      ]);
      setAnalytics(analyticsRes.data);
      setRankData(rankRes.data);
      setLastUpdated(new Date());
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh when window gains focus
    const handleFocus = () => loadAnalytics(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadAnalytics]);

  // Filter scores by selected game
  const filteredScores = analytics?.recentScores?.filter(score => 
    selectedGame === 'all' || score.gameId?.name === selectedGame
  ) || [];

  // Get unique game names for filter
  const gameNames = [...new Set(analytics?.recentScores?.map(s => s.gameId?.name).filter(Boolean) || [])];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  const hasScores = analytics && analytics.totalGames > 0;

  return (
    <div className="myscores-layout">
      <aside className={`myscores-sidebar ${sidebarOpen ? "open" : "closed"}`}>
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
          <Link to="/dashboard" className="nav-item">
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
          <Link to="/my-scores" className="nav-item active">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">My Scores</span>}
          </Link>
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

      <main className="myscores-main">
        <div className="myscores-header">
          <div className="header-content">
            <h1>📈 My Score Analytics</h1>
            <p className="header-subtitle">
              Track your performance and improvement
              <span className="last-updated-text"> • Updated: {lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
          <button 
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`} 
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {!hasScores ? (
          <div className="no-scores-state">
            <span className="no-scores-icon">🎮</span>
            <h2>No Games Played Yet</h2>
            <p>Start playing to see your analytics!</p>
            <Link to="/games" className="btn-play">Play Now</Link>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="stats-overview">
              <div className="stat-card stat-primary">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">Games Played</div>
                  <div className="stat-value">{analytics.totalGames}</div>
                </div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-label">Best Score</div>
                  <div className="stat-value">{analytics.bestScore?.score || 0}</div>
                </div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Average Score</div>
                  <div className="stat-value">{analytics.averageScore}</div>
                </div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <div className="stat-label">Global Rank</div>
                  <div className="stat-value">#{rankData?.rank || "-"}</div>
                </div>
              </div>
            </div>

            {/* Score Breakdown & Skill Impact */}
            <div className="analytics-grid">
              <div className="analytics-card breakdown-card">
                <h3>📊 Score Breakdown</h3>
                <p className="card-subtitle">How your final score is calculated</p>
                
                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">⚡ Speed (40%)</span>
                    <span className="breakdown-value">{analytics.stats?.avgSpeed || 0}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill speed" 
                      style={{ width: `${analytics.stats?.avgSpeed || 0}%`, transition: 'width 0.5s ease' }}
                    ></div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">🎯 Accuracy (40%)</span>
                    <span className="breakdown-value">{analytics.stats?.avgAccuracy || 0}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill accuracy" 
                      style={{ width: `${analytics.stats?.avgAccuracy || 0}%`, transition: 'width 0.5s ease' }}
                    ></div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">🔄 Consistency (20%)</span>
                    <span className="breakdown-value">{analytics.stats?.avgConsistency || 0}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill consistency" 
                      style={{ width: `${analytics.stats?.avgConsistency || 0}%`, transition: 'width 0.5s ease' }}
                    ></div>
                  </div>
                </div>

                <div className="formula-box">
                  <span className="formula-label">Formula:</span>
                  <code>(Speed × 0.4) + (Accuracy × 0.4) + (Consistency × 0.2)</code>
                </div>
              </div>

              <div className="analytics-card skill-card">
                <h3>🧠 Skill Impact</h3>
                <p className="card-subtitle">Your cognitive performance metrics</p>
                
                <div className="skill-grid">
                  <div className="skill-item">
                    <div className="skill-circle focus">
                      <span className="skill-value">{analytics.skillImpact?.focus || 0}</span>
                    </div>
                    <span className="skill-label">Focus</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-circle reflex">
                      <span className="skill-value">{analytics.skillImpact?.reflex || 0}</span>
                    </div>
                    <span className="skill-label">Reflex</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-circle accuracy">
                      <span className="skill-value">{analytics.skillImpact?.accuracy || 0}</span>
                    </div>
                    <span className="skill-label">Accuracy</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-circle consistency">
                      <span className="skill-value">{analytics.skillImpact?.consistency || 0}</span>
                    </div>
                    <span className="skill-label">Consistency</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank & Recent Scores */}
            <div className="analytics-grid">
              <div className="analytics-card rank-card">
                <h3>🏅 Leaderboard Impact</h3>
                <div className="rank-display">
                  <div className="current-rank">
                    <span className="rank-number">#{rankData?.rank || "-"}</span>
                    <span className="rank-label">Current Rank</span>
                  </div>
                  <div className="rank-progress">
                    <div className="points-info">
                      <span className="total-points">{rankData?.totalPoints || 0} pts</span>
                      {rankData?.pointsToNextRank > 0 && (
                        <span className="next-rank-info">
                          {rankData.pointsToNextRank} pts to next rank
                        </span>
                      )}
                    </div>
                    {rankData?.pointsToNextRank > 0 && (
                      <div className="progress-bar rank-progress-bar">
                        <div 
                          className="progress-fill rank" 
                          style={{ 
                            width: `${Math.min(100, (rankData.totalPoints / rankData.nextRankPoints) * 100)}%`,
                            transition: 'width 0.5s ease'
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="analytics-card recent-card">
                <div className="card-header-with-filter">
                  <h3>🕐 Recent Scores</h3>
                  <select 
                    className="game-filter"
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                  >
                    <option value="all">All Games</option>
                    {gameNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="recent-list">
                  {filteredScores.slice(0, 5).map((score, index) => (
                    <div key={score._id} className="recent-item">
                      <div className="recent-rank">{index + 1}</div>
                      <div className="recent-info">
                        <span className="recent-game">{score.gameId?.name || "Game"}</span>
                        <span className="recent-date">
                          {new Date(score.createdAt).toLocaleDateString()} {new Date(score.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="recent-score">{score.finalScore || score.score} pts</div>
                    </div>
                  ))}
                  {filteredScores.length === 0 && (
                    <div className="empty-filter">No scores for this game yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Breakdown */}
            {analytics.gameBreakdown?.length > 0 && (
              <div className="analytics-card game-breakdown-card">
                <h3>🎮 Performance by Game</h3>
                <div className="game-breakdown-grid">
                  {analytics.gameBreakdown.map((game) => (
                    <div key={game.name} className="game-breakdown-item">
                      <div className="game-name">{game.name}</div>
                      <div className="game-stats">
                        <span className="game-plays">{game.plays} plays</span>
                        <span className="game-best">Best: {game.bestScore}</span>
                        <span className="game-avg">Avg: {Math.round(game.totalScore / game.plays)}</span>
                      </div>
                      <div className="game-progress-bar">
                        <div 
                          className="game-progress-fill"
                          style={{ 
                            width: `${Math.min(100, (game.bestScore / (analytics.bestScore?.score || 100)) * 100)}%`,
                            transition: 'width 0.5s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <Link to="/games" className="btn-action btn-primary">
                <span>🎮</span> Play Again
              </Link>
              <Link to="/leaderboard" className="btn-action btn-secondary">
                <span>🏆</span> View Leaderboard
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MyScores;
