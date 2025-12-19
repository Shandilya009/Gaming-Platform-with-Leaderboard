import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

function AdminLogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    action: "",
    category: "",
    sort: "createdAt",
    order: "desc",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("logs"); // logs or summary

  useEffect(() => {
    if (viewMode === "logs") {
      fetchLogs();
    } else {
      fetchSummary();
    }
  }, [pagination.page, filters, viewMode]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogs({
        page: pagination.page,
        limit: 30,
        ...filters,
      });
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogsSummary(7);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
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

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "#ef4444";
    if (action.includes("BAN")) return "#f97316";
    if (action.includes("CREATE")) return "#10b981";
    if (action.includes("UPDATE")) return "#3b82f6";
    if (action.includes("VIEW")) return "#8b5cf6";
    return "#6b7280";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      user: "👥",
      game: "🎮",
      score: "📊",
      dashboard: "📈",
      session: "🔐",
      settings: "⚙️",
      other: "📋",
    };
    return icons[category] || "📋";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
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
          <Link to="/admin/games" className="nav-item">
            <span className="nav-icon">🎮</span>
            {sidebarOpen && <span className="nav-text">Games</span>}
          </Link>
          <Link to="/admin/scores" className="nav-item">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">Scores</span>}
          </Link>
          <Link to="/admin/logs" className="nav-item active">
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
            <h1>📋 Activity Logs</h1>
            <p className="header-subtitle">
              {viewMode === "logs" ? `${pagination.total} log entries` : "Activity Summary"}
            </p>
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "logs" ? "active" : ""}`}
              onClick={() => setViewMode("logs")}
            >
              📋 Logs
            </button>
            <button
              className={`toggle-btn ${viewMode === "summary" ? "active" : ""}`}
              onClick={() => setViewMode("summary")}
            >
              📊 Summary
            </button>
          </div>
        </div>

        {viewMode === "logs" && (
          <>
            {/* Filters */}
            <div className="filters-bar">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="user">👥 User</option>
                <option value="game">🎮 Game</option>
                <option value="score">📊 Score</option>
                <option value="dashboard">📈 Dashboard</option>
                <option value="session">🔐 Session</option>
                <option value="settings">⚙️ Settings</option>
              </select>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="USER_DELETE">User Delete</option>
                <option value="USER_BAN">User Ban</option>
                <option value="USER_UNBAN">User Unban</option>
                <option value="USER_ROLE_CHANGE">Role Change</option>
                <option value="GAME_CREATE">Game Create</option>
                <option value="GAME_DELETE">Game Delete</option>
                <option value="SCORE_DELETE">Score Delete</option>
              </select>
              <button
                className="btn-clear"
                onClick={() => setFilters({ action: "", category: "", sort: "createdAt", order: "desc" })}
              >
                Clear
              </button>
            </div>

            {/* Logs Table */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Admin</th>
                      <th>Category</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td className="time-cell">{formatDate(log.createdAt)}</td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              {log.adminUsername?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span>{log.adminUsername}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {getCategoryIcon(log.category)} {log.category}
                          </span>
                        </td>
                        <td>
                          <span
                            className="action-badge"
                            style={{ backgroundColor: getActionColor(log.action) }}
                          >
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>{log.targetName || "-"}</td>
                        <td className="description-cell">{log.description}</td>
                        <td>
                          <span className={`status-badge status-${log.status}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {viewMode === "summary" && summary && (
          <div className="summary-container">
            <div className="stats-grid">
              <div className="stat-card stat-primary">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-label">Total Actions</div>
                  <div className="stat-value">{summary.totalActions}</div>
                  <div className="stat-trend">Last 7 days</div>
                </div>
              </div>
            </div>

            <div className="admin-grid">
              {/* Actions by Category */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>📊 Actions by Category</h3>
                </div>
                <div className="admin-list">
                  {summary.actionsByCategory.map((item) => (
                    <div key={item._id} className="list-item">
                      <span className="category-icon">{getCategoryIcon(item._id)}</span>
                      <div className="list-content">
                        <div className="list-title">{item._id}</div>
                      </div>
                      <div className="list-value">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions by Admin */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>👤 Actions by Admin</h3>
                </div>
                <div className="admin-list">
                  {summary.actionsByAdmin.map((item, index) => (
                    <div key={item._id} className="list-item">
                      <div className="list-rank">{index + 1}</div>
                      <div className="list-content">
                        <div className="list-title">{item._id}</div>
                      </div>
                      <div className="list-value">{item.count} actions</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Actions */}
              <div className="admin-card full-width">
                <div className="card-header">
                  <h3>⚠️ Recent Critical Actions</h3>
                </div>
                <div className="admin-list">
                  {summary.criticalActions.slice(0, 10).map((log) => (
                    <div key={log._id} className="list-item">
                      <span
                        className="action-badge"
                        style={{ backgroundColor: getActionColor(log.action) }}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <div className="list-content">
                        <div className="list-title">{log.description}</div>
                        <div className="list-subtitle">by {log.adminUsername}</div>
                      </div>
                      <div className="list-date">{formatDate(log.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {logs.length === 0 && !loading && viewMode === "logs" && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No logs found</h3>
            <p>No activity logs match your current filters</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminLogs;
