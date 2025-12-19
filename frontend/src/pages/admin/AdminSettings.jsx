import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [editedSettings, setEditedSettings] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const categories = [
    { id: "all", label: "All Settings", icon: "📋" },
    { id: "general", label: "General", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🔐" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "scoring", label: "Scoring", icon: "📊" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettingChange = (key, value, dataType) => {
    let parsedValue = value;
    if (dataType === "number") {
      parsedValue = parseFloat(value) || 0;
    } else if (dataType === "boolean") {
      parsedValue = value === "true" || value === true;
    }
    setEditedSettings((prev) => ({ ...prev, [key]: parsedValue }));
  };

  const handleSaveSetting = async (key) => {
    if (editedSettings[key] === undefined) return;
    
    try {
      setSaving(true);
      await adminAPI.updateSetting(key, editedSettings[key]);
      
      // Update local state
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value: editedSettings[key] } : s))
      );
      
      // Clear edited value
      setEditedSettings((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      
      setMessage({ type: "success", text: `Setting "${key}" updated successfully` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving setting:", error);
      setMessage({ type: "error", text: "Failed to save setting" });
    } finally {
      setSaving(false);
    }
  };

  const getFilteredSettings = () => {
    if (activeCategory === "all") return settings;
    return settings.filter((s) => s.category === activeCategory);
  };

  const renderSettingInput = (setting) => {
    const currentValue = editedSettings[setting.key] ?? setting.value;
    const hasChanges = editedSettings[setting.key] !== undefined;

    switch (setting.dataType) {
      case "boolean":
        return (
          <div className="setting-input-group">
            <select
              value={currentValue.toString()}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, "boolean")}
              className="setting-select"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            {hasChanges && (
              <button className="btn-save-small" onClick={() => handleSaveSetting(setting.key)}>
                Save
              </button>
            )}
          </div>
        );
      case "number":
        return (
          <div className="setting-input-group">
            <input
              type="number"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, "number")}
              className="setting-input"
              step={setting.key.includes("weight") || setting.key.includes("multiplier") ? "0.1" : "1"}
            />
            {hasChanges && (
              <button className="btn-save-small" onClick={() => handleSaveSetting(setting.key)}>
                Save
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="setting-input-group">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, "string")}
              className="setting-input"
            />
            {hasChanges && (
              <button className="btn-save-small" onClick={() => handleSaveSetting(setting.key)}>
                Save
              </button>
            )}
          </div>
        );
    }
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
          <Link to="/admin/logs" className="nav-item">
            <span className="nav-icon">📋</span>
            {sidebarOpen && <span className="nav-text">Activity Logs</span>}
          </Link>
          <Link to="/admin/settings" className="nav-item active">
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
            <h1>⚙️ Platform Settings</h1>
            <p className="header-subtitle">Configure platform behavior and rules</p>
          </div>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
        )}

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="settings-container">
            {getFilteredSettings().map((setting) => (
              <div key={setting.key} className="setting-card">
                <div className="setting-info">
                  <div className="setting-key">{setting.key.replace(/_/g, " ")}</div>
                  <div className="setting-description">{setting.description}</div>
                  <div className="setting-meta">
                    <span className="setting-category">{setting.category}</span>
                    <span className="setting-type">{setting.dataType}</span>
                  </div>
                </div>
                <div className="setting-value">
                  {setting.isEditable ? (
                    renderSettingInput(setting)
                  ) : (
                    <span className="setting-readonly">{String(setting.value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {getFilteredSettings().length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">⚙️</span>
            <h3>No settings found</h3>
            <p>No settings available for this category</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminSettings;
