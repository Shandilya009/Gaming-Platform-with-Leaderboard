import { useState, useEffect } from 'react';
import './MiniGame.css';

const MemoryGridChallenge = ({ onGameEnd }) => {
  const [gridSize] = useState(4);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [userSelections, setUserSelections] = useState([]);
  const [phase, setPhase] = useState('start'); // start, show, hide, select, result
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showTime, setShowTime] = useState(2000);

  const generateHighlightedCells = (count) => {
    const cells = [];
    while (cells.length < count) {
      const cell = Math.floor(Math.random() * (gridSize * gridSize));
      if (!cells.includes(cell)) {
        cells.push(cell);
      }
    }
    return cells;
  };

  const startRound = () => {
    setPhase('show');
    setUserSelections([]);
    const cellCount = Math.min(3 + round, 8); // Start with 4 cells, max 9
    const cells = generateHighlightedCells(cellCount);
    setHighlightedCells(cells);

    setTimeout(() => {
      setPhase('hide');
      setTimeout(() => {
        setPhase('select');
      }, 500);
    }, showTime);
  };

  const handleCellClick = (index) => {
    if (phase !== 'select') return;

    if (userSelections.includes(index)) {
      setUserSelections(userSelections.filter(i => i !== index));
    } else {
      setUserSelections([...userSelections, index]);
    }
  };

  const submitSelection = () => {
    if (phase !== 'select') return;

    let correct = 0;
    let wrong = 0;

    userSelections.forEach(selection => {
      if (highlightedCells.includes(selection)) {
        correct++;
      } else {
        wrong++;
      }
    });

    // Missed cells count as wrong
    const missed = highlightedCells.length - correct;
    wrong += missed;

    const roundScore = Math.max(0, correct - wrong);
    setScore(prev => prev + roundScore);
    setPhase('result');
  };

  const nextRound = () => {
    if (round >= 5) {
      endGame();
    } else {
      setRound(prev => prev + 1);
      setShowTime(prev => Math.max(1000, prev - 200)); // Decrease show time
      startRound();
    }
  };

  const endGame = () => {
    setPhase('end');
    if (onGameEnd) {
      onGameEnd(score);
    }
  };

  const reset = () => {
    setHighlightedCells([]);
    setUserSelections([]);
    setPhase('start');
    setScore(0);
    setRound(1);
    setShowTime(2000);
  };

  const getCellClass = (index) => {
    if (phase === 'show' && highlightedCells.includes(index)) {
      return 'highlighted';
    }
    if (phase === 'select' && userSelections.includes(index)) {
      return 'selected';
    }
    if (phase === 'result') {
      if (highlightedCells.includes(index) && userSelections.includes(index)) {
        return 'correct';
      }
      if (highlightedCells.includes(index) && !userSelections.includes(index)) {
        return 'missed';
      }
      if (!highlightedCells.includes(index) && userSelections.includes(index)) {
        return 'wrong';
      }
    }
    return '';
  };

  return (
    <div className="mini-game memory-grid-game">
      <div className="game-header">
        <h2>🧠 Memory Grid Challenge</h2>
        <div className="game-stats">
          <div className="stat-box">
            <span className="stat-label">Round</span>
            <span className="stat-value">{round}/5</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
      </div>

      {phase === 'start' && (
        <div className="game-instructions">
          <p>Memorize the highlighted cells in the grid!</p>
          <p className="instruction-detail">5 rounds • Gets harder each round</p>
          <p className="instruction-detail">Score = Correct - Wrong</p>
          <button onClick={startRound} className="start-btn">
            Start Game
          </button>
        </div>
      )}

      {['show', 'hide', 'select', 'result'].includes(phase) && (
        <>
          <div className="memory-grid-status">
            {phase === 'show' && <p className="status-message">📝 Memorize these blocks!</p>}
            {phase === 'hide' && <p className="status-message">🤔 Remember the pattern...</p>}
            {phase === 'select' && <p className="status-message">👆 Click the blocks you remember</p>}
            {phase === 'result' && (
              <p className="status-message">
                ✓ Correct: {userSelections.filter(s => highlightedCells.includes(s)).length} | 
                ✗ Wrong: {userSelections.filter(s => !highlightedCells.includes(s)).length + 
                         (highlightedCells.length - userSelections.filter(s => highlightedCells.includes(s)).length)}
              </p>
            )}
          </div>

          <div className="memory-grid">
            {Array.from({ length: gridSize * gridSize }).map((_, index) => (
              <div
                key={index}
                className={`grid-cell ${getCellClass(index)}`}
                onClick={() => handleCellClick(index)}
              />
            ))}
          </div>

          {phase === 'select' && (
            <button onClick={submitSelection} className="submit-selection-btn">
              Submit ({userSelections.length} selected)
            </button>
          )}

          {phase === 'result' && (
            <button onClick={nextRound} className="next-round-btn">
              {round < 5 ? 'Next Round' : 'Finish Game'}
            </button>
          )}
        </>
      )}

      {phase === 'end' && (
        <div className="game-result">
          <h3>🎉 Game Complete!</h3>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-label">Rounds Completed</span>
              <span className="result-value">5</span>
            </div>
            <div className="result-stat highlight">
              <span className="result-label">Total Score</span>
              <span className="result-value">{score}</span>
            </div>
          </div>
          <button onClick={reset} className="play-again-btn">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryGridChallenge;
