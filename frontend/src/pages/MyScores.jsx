import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { scoresAPI } from "../api/api";
import "./MyScores.css";

/**
 * MyScores Component - Comprehensive Analytics Dashboard
 * Shows: Recent 5 games, Best score, Current score, Skill metrics, Progress tracking
 */
function MyScores() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
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
      // Fetch both user scores and analytics
      const [scoresRes, analyticsRes, rankRes] = await Promise.all([
        scoresAPI.getUserScores(),
        scoresAPI.getUserAnalytics().catch(() => ({ data: null })),
        scoresAPI.getUserRank().catch(() => ({ data: { rank: "-", totalPoints: 0 } }))
      ]);
      
      // Handle different response formats
      const userScores = scoresRes.data?.scores || scoresRes.data || [];
      setScores(Array.isArray(userScores) ? userScores : []);
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
    const handleFocus = () => loadAnalytics(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadAnalytics]);

  // Calculate stats from scores
  const calculateStats = () => {
    if (!scores || scores.length === 0) {
      return { totalGames: 0, bestScore: 0, avgScore: 0, currentScore: 0, totalPoints: 0 };
    }
    const scoreValues = scores.map(s => s.finalScore || s.score || 0);
    const bestScore = Math.max(...scoreValues);
    const totalPoints = scoreValues.reduce((sum, s) => sum + s, 0);
    const avgScore = Math.round(totalPoints / scores.length);
    const currentScore = scoreValues[0] || 0; // Most recent score
    return { totalGames: scores.length, bestScore, avgScore, currentScore, totalPoints };
  };

  const stats = calculateStats();

  // Filter scores by selected game
  const filteredScores = scores.filter(score => 
    selectedGame === 'all' || score.gameId?.name === selectedGame
  );

  // Get unique game names
  const gameNames = [...new Set(scores.map(s => s.gameId?.name).filter(Boolean))];

  // Get best score details
  const bestScoreEntry = scores.reduce((best, current) => {
    const currentVal = current.finalScore || current.score || 0;
    const bestVal = best ? (best.finalScore || best.score || 0) : 0;
    return currentVal > bestVal ? current : best;
  }, null);

  // Calculate improvement (compare last 3 vs previous 3)
  const calculateImprovement = () => {
    if (scores.length < 2) return 0;
    const recent = scores.slice(0, Math.min(3, scores.length));
    const older = scores.slice(3, Math.min(6, scores.length));
    if (older.length === 0) return 0;
    const recentAvg = recent.reduce((sum, s) => sum + (s.finalScore || s.score || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.finalScore || s.score || 0), 0) / older.length;
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  };

  const improvement = calculateImprovement();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  const hasScores = scores && scores.length > 0;

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
            {/* Main Stats Overview */}
            <div className="stats-overview">
              <div className="stat-card stat-primary">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">Games Played</div>
                  <div className="stat-value">{stats.totalGames}</div>
                </div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <div className="stat-label">Best Score</div>
                  <div className="stat-value">{stats.bestScore}</div>
                </div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <div className="stat-label">Current Score</div>
                  <div className="stat-value">{stats.currentScore}</div>
                </div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Average</div>
                  <div className="stat-value">{stats.avgScore}</div>
                </div>
              </div>
            </div>

            {/* Score Comparison Card */}
            <div className="comparison-section">
              <div className="comparison-card">
                <h3>📊 Score Comparison</h3>
                <div className="comparison-grid">
                  <div className="comparison-item best">
                    <div className="comparison-label">🏆 Best Score</div>
                    <div className="comparison-value">{stats.bestScore}</div>
                    <div className="comparison-game">{bestScoreEntry?.gameId?.name || 'N/A'}</div>
                  </div>
                  <div className="comparison-item current">
                    <div className="comparison-label">⚡ Latest Score</div>
                    <div className="comparison-value">{stats.currentScore}</div>
                    <div className="comparison-game">{scores[0]?.gameId?.name || 'N/A'}</div>
                  </div>
                  <div className="comparison-item average">
                    <div className="comparison-label">📈 Average</div>
                    <div className="comparison-value">{stats.avgScore}</div>
                    <div className="comparison-game">All Games</div>
                  </div>
                  <div className={`comparison-item improvement ${improvement >= 0 ? 'positive' : 'negative'}`}>
                    <div className="comparison-label">📈 Improvement</div>
                    <div className="comparison-value">{improvement >= 0 ? '+' : ''}{improvement}%</div>
                    <div className="comparison-game">vs Previous</div>
                  </div>
                </div>
              </div>

              {/* Rank Card */}
              <div className="rank-card-small">
                <h3>🏅 Global Rank</h3>
                <div className="rank-display-small">
                  <div className="rank-number-large">#{rankData?.rank || "-"}</div>
                  <div className="rank-details">
                    <span className="total-pts">{user.totalPoints} total pts</span>
                    {rankData?.pointsToNextRank > 0 && (
                      <span className="next-rank">{rankData.pointsToNextRank} pts to next rank</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent 5 Games */}
            <div className="recent-games-section">
              <div className="section-header">
                <h3>🕐 Recent 5 Games</h3>
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
              <div className="recent-games-list">
                {filteredScores.slice(0, 5).map((score, index) => {
                  const scoreVal = score.finalScore || score.score || 0;
                  const isBest = scoreVal === stats.bestScore;
                  return (
                    <div key={score._id} className={`recent-game-item ${isBest ? 'is-best' : ''}`}>
                      <div className="game-rank">{index + 1}</div>
                      <div className="game-icon">
                        {score.gameId?.type === 'speed' ? '⚡' : 
                         score.gameId?.type === 'logic' ? '🧠' :
                         score.gameId?.type === 'puzzle' ? '🧩' :
                         score.gameId?.type === 'reflex' ? '🎯' :
                         score.gameId?.type === 'memory' ? '💭' : '🎮'}
                      </div>
                      <div className="game-details">
                        <div className="game-name">{score.gameId?.name || "Game"}</div>
                        <div className="game-date">
                          {new Date(score.createdAt).toLocaleDateString()} at {new Date(score.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="game-score-section">
                        <div className="game-score">{scoreVal} pts</div>
                        {isBest && <span className="best-badge">🏆 Best</span>}
                      </div>
                    </div>
                  );
                })}
                {filteredScores.length === 0 && (
                  <div className="empty-filter">No scores for this game yet</div>
                )}
              </div>
            </div>

            {/* Performance by Game */}
            <div className="performance-section">
              <h3>🎮 Performance by Game</h3>
              <div className="performance-grid">
                {gameNames.map(gameName => {
                  const gameScores = scores.filter(s => s.gameId?.name === gameName);
                  const gameBest = Math.max(...gameScores.map(s => s.finalScore || s.score || 0));
                  const gameAvg = Math.round(gameScores.reduce((sum, s) => sum + (s.finalScore || s.score || 0), 0) / gameScores.length);
                  const gameType = gameScores[0]?.gameId?.type;
                  return (
                    <div key={gameName} className="performance-item">
                      <div className="perf-header">
                        <span className="perf-icon">
                          {gameType === 'speed' ? '⚡' : 
                           gameType === 'logic' ? '🧠' :
                           gameType === 'puzzle' ? '🧩' :
                           gameType === 'reflex' ? '🎯' :
                           gameType === 'memory' ? '💭' : '🎮'}
                        </span>
                        <span className="perf-name">{gameName}</span>
                      </div>
                      <div className="perf-stats">
                        <div className="perf-stat">
                          <span className="perf-label">Plays</span>
                          <span className="perf-value">{gameScores.length}</span>
                        </div>
                        <div className="perf-stat">
                          <span className="perf-label">Best</span>
                          <span className="perf-value best">{gameBest}</span>
                        </div>
                        <div className="perf-stat">
                          <span className="perf-label">Avg</span>
                          <span className="perf-value">{gameAvg}</span>
                        </div>
                      </div>
                      <div className="perf-bar">
                        <div 
                          className="perf-bar-fill"
                          style={{ width: `${Math.min(100, (gameBest / stats.bestScore) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score Breakdown (if analytics available) */}
            {analytics?.stats && (
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
                      <div className="progress-fill speed" style={{ width: `${analytics.stats?.avgSpeed || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span className="breakdown-label">🎯 Accuracy (40%)</span>
                      <span className="breakdown-value">{analytics.stats?.avgAccuracy || 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill accuracy" style={{ width: `${analytics.stats?.avgAccuracy || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span className="breakdown-label">🔄 Consistency (20%)</span>
                      <span className="breakdown-value">{analytics.stats?.avgConsistency || 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill consistency" style={{ width: `${analytics.stats?.avgConsistency || 0}%` }}></div>
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
