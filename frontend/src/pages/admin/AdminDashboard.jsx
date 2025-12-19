import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      if (error.response?.status === 403) {
        alert("Admin access required");
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-error">
        <h2>Unable to load dashboard</h2>
        <Link to="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">⚙️</span>
            {sidebarOpen && <span className="logo-text">Admin Panel</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item active">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>
          <Link to="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span>
            {sidebarOpen && <span className="nav-text">Users</span>}
          </Link>
          <Link to="/admin/games" className="nav-item">
            <span className="nav-icon">🎮</span>
            {sidebarOpen && <span className="nav-text">Games</span>}
          </Link>
          <Link to="/admin/scores" className="nav-item">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">Scores</span>}
          </Link>
          <Link to="/admin/logs" className="nav-item">
            <span className="nav-icon">📋</span>
            {sidebarOpen && <span className="nav-text">Activity Logs</span>}
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            {sidebarOpen && <span className="nav-text">Settings</span>}
          </Link>
          <div className="nav-divider"></div>
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span className="nav-text">Back to App</span>}
          </Link>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-section">
              <div className="user-avatar admin-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div className="header-content">
            <h1>📊 Admin Dashboard</h1>
            <p className="header-subtitle">Platform overview and statistics</p>
          </div>
          <button className="btn-refresh" onClick={fetchStats}>
            🔄 Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.overview.totalUsers}</div>
              <div className="stat-trend">+{stats.today.newUsers} today</div>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <div className="stat-label">Total Games</div>
              <div className="stat-value">{stats.overview.totalGames}</div>
              <div className="stat-trend">Available to play</div>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">{stats.overview.totalScores}</div>
              <div className="stat-trend">+{stats.today.gamesPlayed} today</div>
            </div>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{stats.overview.activeUsers}</div>
              <div className="stat-trend">Last 7 days</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="stats-row">
          <div className="stat-card-small">
            <span className="stat-icon-small">🏆</span>
            <div>
              <div className="stat-value-small">{stats.overview.totalPointsInSystem.toLocaleString()}</div>
              <div className="stat-label-small">Total Points Earned</div>
            </div>
          </div>
          <div className="stat-card-small">
            <span className="stat-icon-small">🚫</span>
            <div>
              <div className="stat-value-small">{stats.overview.bannedUsers}</div>
              <div className="stat-label-small">Banned Users</div>
            </div>
          </div>
          <div className="stat-card-small">
            <span className="stat-icon-small">📅</span>
            <div>
              <div className="stat-value-small">{stats.thisWeek.newUsers}</div>
              <div className="stat-label-small">New Users This Week</div>
            </div>
          </div>
          <div className="stat-card-small">
            <span className="stat-icon-small">🎲</span>
            <div>
              <div className="stat-value-small">{stats.thisWeek.gamesPlayed}</div>
              <div className="stat-label-small">Games This Week</div>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          {/* Popular Games */}
          <div className="admin-card">
            <div className="card-header">
              <h3>🔥 Popular Games</h3>
              <Link to="/admin/games" className="view-all-link">Manage →</Link>
            </div>
            <div className="admin-list">
              {stats.popularGames.map((game, index) => (
                <div key={game._id} className="list-item">
                  <div className="list-rank">{index + 1}</div>
                  <div className="list-content">
                    <div className="list-title">{game.name}</div>
                    <div className="list-subtitle">{game.type}</div>
                  </div>
                  <div className="list-value">{game.popularity} plays</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Players */}
          <div className="admin-card">
            <div className="card-header">
              <h3>🏆 Top Players</h3>
              <Link to="/admin/users" className="view-all-link">View All →</Link>
            </div>
            <div className="admin-list">
              {stats.topPlayers.map((player, index) => (
                <div key={player._id} className="list-item">
                  <div className="list-rank">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  <div className="list-content">
                    <div className="list-title">{player.username}</div>
                  </div>
                  <div className="list-value">{player.totalPoints.toLocaleString()} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="admin-card">
            <div className="card-header">
              <h3>👤 Recent Signups</h3>
              <Link to="/admin/users" className="view-all-link">View All →</Link>
            </div>
            <div className="admin-list">
              {stats.recentUsers.map((user) => (
                <div key={user._id} className="list-item">
                  <div className="list-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="list-content">
                    <div className="list-title">{user.username}</div>
                    <div className="list-subtitle">{user.email}</div>
                  </div>
                  <div className="list-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="card-header">
              <h3>⚡ Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <Link to="/admin/games" className="action-btn action-primary">
                <span>➕</span> Add New Game
              </Link>
              <Link to="/admin/users" className="action-btn action-secondary">
                <span>👥</span> Manage Users
              </Link>
              <Link to="/admin/scores" className="action-btn action-warning">
                <span>📊</span> View Scores
              </Link>
              <Link to="/dashboard" className="action-btn action-outline">
                <span>🏠</span> Back to App
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
