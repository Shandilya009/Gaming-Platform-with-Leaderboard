import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI, gamesAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Admin.css";

function AdminScores() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    gameId: "",
    sort: "createdAt",
    order: "desc",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    fetchScores();
  }, [pagination.page, filters]);

  const fetchGames = async () => {
    try {
      const response = await gamesAPI.getAll();
      setGames(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getScores({
        page: pagination.page,
        limit: 20,
        ...filters,
      });
      setScores(response.data.scores);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteScore = async (score) => {
    if (!confirm(`Delete this score? This will also subtract ${score.finalScore || score.score} points from the user.`)) {
      return;
    }

    try {
      await adminAPI.deleteScore(score._id);
      fetchScores();
    } catch (error) {
      console.error("Error deleting score:", error);
      alert("Failed to delete score");
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      speed: "#FF6B35",
      logic: "#8B5CF6",
      puzzle: "#10B981",
      memory: "#F59E0B",
      reflex: "#EF4444",
    };
    return colors[type] || "#6366F1";
  };

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
          <Link to="/admin" className="nav-item">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>
          <Link to="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span>
            {sidebarOpen && <span className="nav-text">Users</span>}
          </Link>
          <Link to="/admin/scores" className="nav-item active">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">Scores</span>}
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
            <h1>📈 Score Management</h1>
            <p className="header-subtitle">{pagination.total} scores total</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            value={filters.gameId}
            onChange={(e) => handleFilterChange("gameId", e.target.value)}
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game._id} value={game._id}>
                {game.name}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="createdAt">Date</option>
            <option value="finalScore">Score</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => handleFilterChange("order", e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button
            className="btn-clear"
            onClick={() => setFilters({ gameId: "", sort: "createdAt", order: "desc" })}
          >
            Clear
          </button>
        </div>

        {/* Scores Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Game</th>
                  <th>Score</th>
                  <th>Speed</th>
                  <th>Accuracy</th>
                  <th>Consistency</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr key={score._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {score.userId?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span>{score.userId?.username || "Unknown"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="game-cell">
                        <span
                          className="game-type-dot"
                          style={{ backgroundColor: getTypeColor(score.gameId?.type) }}
                        ></span>
                        {score.gameId?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="score-cell">
                      <strong>{score.finalScore || score.score}</strong>
                    </td>
                    <td>{score.speedScore || 0}</td>
                    <td>{score.accuracyScore || 0}</td>
                    <td>{score.consistencyScore || 0}</td>
                    <td>
                      {new Date(score.createdAt).toLocaleDateString()}{" "}
                      {new Date(score.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        className="btn-action-small btn-danger"
                        onClick={() => handleDeleteScore(score)}
                        title="Delete Score"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scores.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <h3>No scores found</h3>
            <p>No scores match your current filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            >
              ← Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminScores;
