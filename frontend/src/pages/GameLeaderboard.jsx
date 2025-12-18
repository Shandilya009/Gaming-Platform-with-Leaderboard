import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scoresAPI, gamesAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

function GameLeaderboard() {
  const { gameId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, gameRes] = await Promise.all([
        scoresAPI.getGameLeaderboard(gameId, 100),
        gamesAPI.getById(gameId)
      ]);
      setLeaderboard(leaderboardRes.data);
      setGame(gameRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <h1>🎮 {game?.name} Leaderboard</h1>
        <p>Top scores for this game</p>
        <div className="header-actions">
          <Link to={`/game/${gameId}`} className="back-link">← Play Game</Link>
          <Link to="/leaderboard" className="back-link">Global Leaderboard</Link>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="player-col">Player</div>
          <div className="points-col">Score</div>
          <div className="date-col">Date</div>
        </div>

        {leaderboard.map((entry, index) => (
          <div 
            key={entry._id} 
            className={`table-row ${entry.userId?.username === user?.username ? 'current-user' : ''}`}
          >
            <div className="rank-col">
              <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
            </div>
            <div className="player-col">
              <span className="player-name">{entry.userId?.username || 'Anonymous'}</span>
              {entry.userId?.username === user?.username && (
                <span className="you-badge">YOU</span>
              )}
            </div>
            <div className="points-col">
              <span className="points-value">{entry.score.toLocaleString()}</span>
            </div>
            <div className="date-col">
              {new Date(entry.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="no-data">
          <p>No scores yet. Be the first to play!</p>
          <Link to={`/game/${gameId}`} className="btn-primary">Play Now</Link>
        </div>
      )}
    </div>
  );
}

export default GameLeaderboard;
