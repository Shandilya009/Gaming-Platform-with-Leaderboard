import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gamesAPI, scoresAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import TypingSpeedTest from '../components/games/TypingSpeedTest';
import SpeedMathChallenge from '../components/games/SpeedMathChallenge';
import WordUnscramble from '../components/games/WordUnscramble';
import MemoryGridChallenge from '../components/games/MemoryGridChallenge';
import ReflexBarStopper from '../components/games/ReflexBarStopper';
import './GamePlay.css';

function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUserPoints, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      const response = await gamesAPI.getById(id);
      setGame(response.data);
    } catch (error) {
      console.error('Error fetching game:', error);
      alert('Game not found');
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  const handleGameEnd = async (score) => {
    if (scoreSubmitted) return;
    
    setSubmittingScore(true);
    try {
      await scoresAPI.submit({ gameId: id, score });
      updateUserPoints(score);
      setScoreSubmitted(true);
      setTimeout(() => setScoreSubmitted(false), 2000);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setSubmittingScore(false);
    }
  };

  const renderGame = () => {
    if (!game) return null;

    const gameComponents = {
      'Typing Speed Test': TypingSpeedTest,
      'Speed Math Challenge': SpeedMathChallenge,
      'Word Unscramble': WordUnscramble,
      'Memory Grid Challenge': MemoryGridChallenge,
      'Reflex Bar Stopper': ReflexBarStopper
    };

    const GameComponent = gameComponents[game.name];
    
    if (!GameComponent) {
      return <div className="game-not-available">This game is not yet implemented.</div>;
    }

    return <GameComponent onGameEnd={handleGameEnd} />;
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  return (
    <div className="gameplay-container">
      <div className="gameplay-header">
        <div className="header-left">
          <Link to="/games" className="back-button">← Back to Games</Link>
        </div>
        <div className="game-info">
          <h1>{game.name}</h1>
          <p>{game.description}</p>
          <div className="game-meta">
            <span className={`difficulty-badge ${game.difficulty}`}>
              {game.difficulty}
            </span>
            <span className="type-badge">{game.type}</span>
            <Link to={`/leaderboard/game/${game._id}`} className="leaderboard-link">
              View Leaderboard →
            </Link>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn-small" title="Logout">
            🚪
          </button>
        </div>
      </div>

      <div className="game-play-area">
        {renderGame()}
      </div>

      {submittingScore && (
        <div className="score-notification submitting">
          Submitting score...
        </div>
      )}

      {scoreSubmitted && (
        <div className="score-notification success">
          ✓ Score submitted successfully!
        </div>
      )}
    </div>
  );
}

export default GamePlay;
