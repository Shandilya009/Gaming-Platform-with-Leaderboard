import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

function AdminGames() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedGame, setSelectedGame] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "speed",
    difficulty: "medium",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGames();
      setGames(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", description: "", type: "speed", difficulty: "medium" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (game) => {
    setModalMode("edit");
    setSelectedGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      type: game.type,
      difficulty: game.difficulty,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGame(null);
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.description) {
      setFormError("Name and description are required");
      return;
    }

    try {
      if (modalMode === "create") {
        await adminAPI.createGame(formData);
      } else {
        await adminAPI.updateGame(selectedGame._id, formData);
      }
      fetchGames();
      closeModal();
    } catch (error) {
      console.error("Error saving game:", error);
      setFormError(error.response?.data?.message || "Failed to save game");
    }
  };

  const handleDeleteGame = async (game) => {
    if (!confirm(`Are you sure you want to delete "${game.name}"? This will also delete all scores for this game.`)) {
      return;
    }

    try {
      await adminAPI.deleteGame(game._id);
      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Failed to delete game");
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "#10b981",
      medium: "#f59e0b",
      hard: "#ef4444",
    };
    return colors[difficulty] || "#6366f1";
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
          <Link to="/admin/games" className="nav-item active">
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
            <h1>🎮 Game Management</h1>
            <p className="header-subtitle">{games.length} games available</p>
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            ➕ Add New Game
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="games-admin-grid">
            {games.map((game) => (
              <div key={game._id} className="game-admin-card">
                <div className="game-admin-header">
                  <div
                    className="game-type-badge"
                    style={{ backgroundColor: getTypeColor(game.type) }}
                  >
                    {game.type}
                  </div>
                  <div
                    className="game-difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(game.difficulty) }}
                  >
                    {game.difficulty}
                  </div>
                </div>
                <h3 className="game-admin-title">{game.name}</h3>
                <p className="game-admin-description">{game.description}</p>
                <div className="game-admin-stats">
                  <div className="game-stat">
                    <span className="stat-icon">🎯</span>
                    <span>{game.playCount || 0} plays</span>
                  </div>
                  <div className="game-stat">
                    <span className="stat-icon">📊</span>
                    <span>Avg: {game.avgScore || 0}</span>
                  </div>
                  <div className="game-stat">
                    <span className="stat-icon">🔥</span>
                    <span>{game.popularity} popularity</span>
                  </div>
                </div>
                <div className="game-admin-actions">
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(game)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteGame(game)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {games.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🎮</span>
            <h3>No games yet</h3>
            <p>Create your first game to get started</p>
            <button className="btn-primary" onClick={openCreateModal}>
              ➕ Add New Game
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              <h3>{modalMode === "create" ? "➕ Create New Game" : "✏️ Edit Game"}</h3>
              
              <form onSubmit={handleSubmit}>
                {formError && <div className="form-error">{formError}</div>}
                
                <div className="form-group">
                  <label htmlFor="name">Game Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter game name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter game description"
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="speed">⚡ Speed</option>
                      <option value="logic">🧠 Logic</option>
                      <option value="puzzle">🧩 Puzzle</option>
                      <option value="memory">🎯 Memory</option>
                      <option value="reflex">⚡ Reflex</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {modalMode === "create" ? "Create Game" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminGames;
