import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Admin.css";

function AdminUsers() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    role: "",
    sort: "createdAt",
    order: "desc",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: 15,
        ...filters,
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalAction("");
    setShowModal(false);
  };

  const handleBanUser = async (banReason = "") => {
    try {
      await adminAPI.updateUser(selectedUser._id, {
        status: "banned",
        banReason: banReason || "Violation of terms of service",
      });
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, { status: "active" });
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert("Failed to unban user");
    }
  };

  const handleChangeRole = async (newRole) => {
    try {
      await adminAPI.updateUser(selectedUser._id, { role: newRole });
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change role");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "status-active",
      banned: "status-banned",
      suspended: "status-suspended",
    };
    return badges[status] || "status-active";
  };

  const getRoleBadge = (role) => {
    return role === "admin" ? "role-admin" : "role-user";
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
          <Link to="/admin/users" className="nav-item active">
            <span className="nav-icon">👥</span>
            {sidebarOpen && <span className="nav-text">Users</span>}
          </Link>
          <Link to="/admin/scores" className="nav-item">
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
            <h1>👥 User Management</h1>
            <p className="header-subtitle">
              {pagination.total} users total
            </p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="createdAt">Join Date</option>
            <option value="totalPoints">Points</option>
            <option value="username">Username</option>
          </select>
          <button
            className="btn-clear"
            onClick={() =>
              setFilters({ search: "", status: "", role: "", sort: "createdAt", order: "desc" })
            }
          >
            Clear
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Points</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={u._id === user.id ? "current-user-row" : ""}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.username}</span>
                        {u._id === user.id && <span className="you-badge">YOU</span>}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.totalPoints.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u._id !== user.id && (
                        <div className="action-buttons">
                          {u.status === "active" ? (
                            <button
                              className="btn-action-small btn-danger"
                              onClick={() => openModal(u, "ban")}
                              title="Ban User"
                            >
                              🚫
                            </button>
                          ) : (
                            <button
                              className="btn-action-small btn-success"
                              onClick={() => openModal(u, "unban")}
                              title="Unban User"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            className="btn-action-small btn-warning"
                            onClick={() => openModal(u, "role")}
                            title="Change Role"
                          >
                            👑
                          </button>
                          <button
                            className="btn-action-small btn-danger"
                            onClick={() => openModal(u, "delete")}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
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

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              
              {modalAction === "ban" && (
                <>
                  <h3>🚫 Ban User</h3>
                  <p>Are you sure you want to ban <strong>{selectedUser.username}</strong>?</p>
                  <textarea
                    id="banReason"
                    placeholder="Enter ban reason (optional)"
                    className="modal-textarea"
                  />
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button
                      className="btn-danger"
                      onClick={() => handleBanUser(document.getElementById("banReason").value)}
                    >
                      Ban User
                    </button>
                  </div>
                </>
              )}

              {modalAction === "unban" && (
                <>
                  <h3>✅ Unban User</h3>
                  <p>Are you sure you want to unban <strong>{selectedUser.username}</strong>?</p>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button className="btn-success" onClick={handleUnbanUser}>
                      Unban User
                    </button>
                  </div>
                </>
              )}

              {modalAction === "role" && (
                <>
                  <h3>👑 Change Role</h3>
                  <p>Change role for <strong>{selectedUser.username}</strong></p>
                  <p>Current role: <span className={`badge ${getRoleBadge(selectedUser.role)}`}>{selectedUser.role}</span></p>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                    {selectedUser.role === "user" ? (
                      <button className="btn-warning" onClick={() => handleChangeRole("admin")}>
                        Make Admin
                      </button>
                    ) : (
                      <button className="btn-secondary" onClick={() => handleChangeRole("user")}>
                        Remove Admin
                      </button>
                    )}
                  </div>
                </>
              )}

              {modalAction === "delete" && (
                <>
                  <h3>🗑️ Delete User</h3>
                  <p>Are you sure you want to permanently delete <strong>{selectedUser.username}</strong>?</p>
                  <p className="warning-text">⚠️ This will also delete all their scores and cannot be undone!</p>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                    <button className="btn-danger" onClick={handleDeleteUser}>
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;
