import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gamesAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Games.css';

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    type: '',
    sort: 'popularity'
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchGames();
  }, [filters]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAll(filters);
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'medium': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'hard': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6366f1, #4f46e5)';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      speed: '⚡',
      logic: '🧠',
      puzzle: '🧩',
      memory: '🎯',
      reflex: '⚡'
    };
    return icons[type] || '🎮';
  };

  const getTypeColor = (type) => {
    const colors = {
      speed: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
      logic: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
      puzzle: 'linear-gradient(135deg, #10B981, #14B8A6)',
      memory: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      reflex: 'linear-gradient(135deg, #EF4444, #F87171)'
    };
    return colors[type] || 'linear-gradient(135deg, #6366F1, #818CF8)';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing games...</p>
      </div>
    );
  }

  return (
    <div className="games-layout">
      {/* Sidebar */}
      <aside className={`games-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🎮</span>
            {sidebarOpen && <span className="logo-text">GameZone</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>
          <Link to="/games" className="nav-item active">
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

      {/* Main Content */}
      <main className="games-main">
        <div className="games-header">
          <div className="header-content">
            <h1>🎮 Games Collection</h1>
            <p className="header-subtitle">Choose your challenge and start earning points!</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{games.length}</span>
              <span className="stat-label">Games</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-header">
            <h3>Filter & Sort</h3>
            <button 
              className="clear-filters"
              onClick={() => setFilters({ difficulty: '', type: '', sort: 'popularity' })}
            >
              Clear All
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>
                <span className="filter-icon">📊</span>
                Difficulty
              </label>
              <select 
                value={filters.difficulty} 
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <span className="filter-icon">🎨</span>
                Type
              </label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="speed">⚡ Speed</option>
                <option value="logic">🧠 Logic</option>
                <option value="puzzle">🧩 Puzzle</option>
                <option value="memory">🎯 Memory</option>
                <option value="reflex">⚡ Reflex</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <span className="filter-icon">🔢</span>
                Sort by
              </label>
              <select 
                value={filters.sort} 
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="popularity">🔥 Most Popular</option>
                <option value="newest">✨ Newest First</option>
                <option value="name">📝 Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="games-grid">
          {games.map((game) => (
            <Link to={`/game/${game._id}`} key={game._id} className="game-card">
              <div className="game-card-bg" style={{ background: getTypeColor(game.type) }}></div>
              <div className="game-card-content">
                <div className="game-icon-wrapper">
                  <div className="game-icon" style={{ background: getTypeColor(game.type) }}>
                    {getTypeIcon(game.type)}
                  </div>
                </div>
                
                <div className="game-card-header">
                  <h3>{game.name}</h3>
                  <div className="game-badges">
                    <div 
                      className="difficulty-badge"
                      style={{ background: getDifficultyColor(game.difficulty) }}
                    >
                      {game.difficulty}
                    </div>
                  </div>
                </div>

                <p className="game-description">{game.description}</p>

                <div className="game-card-footer">
                  <div className="game-type" style={{ background: getTypeColor(game.type) }}>
                    {getTypeIcon(game.type)} {game.type}
                  </div>
                  <div className="game-popularity">
                    <span className="popularity-icon">🔥</span>
                    <span className="popularity-count">{game.popularity}</span>
                  </div>
                </div>

                <div className="play-overlay">
                  <button className="play-button">
                    <span className="play-icon">▶</span>
                    Play Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {games.length === 0 && (
          <div className="no-games">
            <div className="empty-icon">🎮</div>
            <h3>No games found</h3>
            <p>Try adjusting your filters to see more games.</p>
            <button 
              className="reset-button"
              onClick={() => setFilters({ difficulty: '', type: '', sort: 'popularity' })}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Games;
