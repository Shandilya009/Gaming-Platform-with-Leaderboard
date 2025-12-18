import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scoresAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await scoresAPI.getGlobalLeaderboard(100);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="header-content">
          <h1>🏆 Global Leaderboard</h1>
          <p>Top players ranked by total points</p>
          <Link to="/games" className="back-link">← Back to Games</Link>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="user-points">{user.totalPoints} pts</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="player-col">Player</div>
          <div className="points-col">Points</div>
        </div>

        {leaderboard.map((player, index) => (
          <div 
            key={player._id} 
            className={`table-row ${player.username === user?.username ? 'current-user' : ''}`}
          >
            <div className="rank-col">
              <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
            </div>
            <div className="player-col">
              <span className="player-name">{player.username}</span>
              {player.username === user?.username && (
                <span className="you-badge">YOU</span>
              )}
            </div>
            <div className="points-col">
              <span className="points-value">{player.totalPoints.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="no-data">
          <p>No players on the leaderboard yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
