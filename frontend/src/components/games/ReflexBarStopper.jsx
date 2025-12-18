import { useState, useEffect, useRef } from 'react';
import './MiniGame.css';

const ReflexBarStopper = ({ onGameEnd }) => {
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const maxAttempts = 5;
  const animationRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setPosition(prev => {
          let newPos = prev + (speed * direction);
          
          if (newPos >= 100) {
            newPos = 100;
            setDirection(-1);
          } else if (newPos <= 0) {
            newPos = 0;
            setDirection(1);
          }
          
          return newPos;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isActive, speed, direction]);

  const startGame = () => {
    setIsActive(true);
    setAttempts([]);
    setCurrentAttempt(1);
    setPosition(50);
    setDirection(1);
    setSpeed(1);
  };

  const stopBar = () => {
    if (!isActive) return;

    // Calculate score based on how close to center (50)
    const distanceFromCenter = Math.abs(position - 50);
    const score = Math.max(0, Math.round(100 - (distanceFromCenter * 2)));
    
    setAttempts(prev => [...prev, score]);

    if (currentAttempt >= maxAttempts) {
      endGame([...attempts, score]);
    } else {
      setCurrentAttempt(prev => prev + 1);
      setPosition(50);
      setDirection(1);
      setSpeed(prev => prev + 0.3); // Increase difficulty
    }
  };

  const endGame = (finalAttempts) => {
    setIsActive(false);
    setIsFinished(true);
    const averageScore = Math.round(
      finalAttempts.reduce((sum, score) => sum + score, 0) / finalAttempts.length
    );
    if (onGameEnd) {
      onGameEnd(averageScore);
    }
  };

  const reset = () => {
    setPosition(50);
    setDirection(1);
    setSpeed(1);
    setIsActive(false);
    setIsFinished(false);
    setAttempts([]);
    setCurrentAttempt(1);
  };

  const getColorForScore = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, score) => sum + score, 0) / attempts.length)
    : 0;

  return (
    <div className="mini-game reflex-bar-game">
      <div className="game-header">
        <h2>⚡ Reflex Bar Stopper</h2>
        <div className="game-stats">
          <div className="stat-box">
            <span className="stat-label">Attempt</span>
            <span className="stat-value">{currentAttempt}/{maxAttempts}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Score</span>
            <span className="stat-value">{averageScore}</span>
          </div>
        </div>
      </div>

      {!isActive && !isFinished && (
        <div className="game-instructions">
          <p>Stop the bar as close to the center as possible!</p>
          <p className="instruction-detail">{maxAttempts} attempts • Bar gets faster each time</p>
          <p className="instruction-detail">Score: 0-100 (100 = perfect center)</p>
          <button onClick={startGame} className="start-btn">
            Start Game
          </button>
        </div>
      )}

      {isActive && (
        <>
          <div className="reflex-bar-container">
            <div className="bar-track">
              <div className="center-zone"></div>
              <div 
                className="bar-indicator"
                style={{ left: `${position}%` }}
              />
              <div className="center-marker"></div>
            </div>
          </div>

          <div className="reflex-attempts">
            {attempts.map((score, index) => (
              <div
                key={index}
                className="attempt-score"
                style={{ backgroundColor: getColorForScore(score) }}
              >
                {score}
              </div>
            ))}
          </div>

          <button onClick={stopBar} className="stop-btn">
            STOP!
          </button>
        </>
      )}

      {isFinished && (
        <div className="game-result">
          <h3>🎉 Game Complete!</h3>
          <div className="result-stats">
            <div className="attempts-breakdown">
              <h4>Your Attempts:</h4>
              <div className="attempts-list">
                {attempts.map((score, index) => (
                  <div key={index} className="attempt-item">
                    <span className="attempt-label">Attempt {index + 1}:</span>
                    <span 
                      className="attempt-value"
                      style={{ color: getColorForScore(score) }}
                    >
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="result-stat highlight">
              <span className="result-label">Average Score</span>
              <span className="result-value">{averageScore}</span>
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

export default ReflexBarStopper;
