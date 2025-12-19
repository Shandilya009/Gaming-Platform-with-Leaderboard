import { useState, useEffect, useRef } from 'react';
import './MiniGame.css';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Technology has revolutionized the way we communicate and work together.",
  "Practice makes perfect when it comes to improving your typing speed.",
  "Adventure awaits those who are brave enough to explore new horizons.",
  "Success is not final failure is not fatal it is the courage to continue.",
  "The greatest glory in living lies not in never falling but in rising every time we fall.",
  "Life is what happens when you are busy making other plans for the future.",
  "Believe you can and you are halfway there to achieving your dreams and goals."
];

const TypingSpeedTest = ({ onGameEnd }) => {
  const [paragraph, setParagraph] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef(null);

  useEffect(() => {
    // Select random paragraph on mount
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setParagraph(randomParagraph);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startGame = () => {
    setIsActive(true);
    setUserInput('');
    inputRef.current?.focus();
  };

  const calculateResults = () => {
    const words = userInput.trim().split(/\s+/).length;
    const minutes = (30 - timeLeft) / 60;
    const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === paragraph[i]) {
        correctChars++;
      }
    }
    const calculatedAccuracy = userInput.length > 0 
      ? Math.round((correctChars / userInput.length) * 100) 
      : 100;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);

    return Math.round(calculatedWpm * (calculatedAccuracy / 100));
  };

  const endGame = () => {
    setIsActive(false);
    setIsFinished(true);
    const finalScore = calculateResults();
    if (onGameEnd) {
      // Send enhanced score data with metrics
      onGameEnd({
        score: finalScore,
        speedScore: Math.min(100, wpm * 2), // WPM scaled to 0-100
        accuracyScore: accuracy,
        consistencyScore: 70, // Default for typing
        timeTaken: 30 - timeLeft
      });
    }
  };

  const handleInputChange = (e) => {
    if (!isActive) return;
    const value = e.target.value;
    setUserInput(value);

    // Auto-calculate stats in real-time
    if (value.length > 0) {
      const words = value.trim().split(/\s+/).length;
      const elapsed = 30 - timeLeft;
      const minutes = elapsed / 60;
      if (minutes > 0) {
        setWpm(Math.round(words / minutes));
      }

      let correctChars = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === paragraph[i]) {
          correctChars++;
        }
      }
      setAccuracy(Math.round((correctChars / value.length) * 100));
    }
  };

  const getCharacterClass = (index) => {
    if (index >= userInput.length) return '';
    return userInput[index] === paragraph[index] ? 'correct' : 'incorrect';
  };

  const reset = () => {
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setParagraph(randomParagraph);
    setUserInput('');
    setTimeLeft(30);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  };

  return (
    <div className="mini-game typing-speed-game">
      <div className="game-header">
        <h2>⌨️ Typing Speed Test</h2>
        <div className="game-stats">
          <div className="stat-box">
            <span className="stat-label">Time</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{wpm}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
        </div>
      </div>

      {!isActive && !isFinished && (
        <div className="game-instructions">
          <p>Type the paragraph below as quickly and accurately as possible!</p>
          <p className="instruction-detail">You have 30 seconds. Your score = WPM × Accuracy%</p>
          <button onClick={startGame} className="start-btn">
            Start Typing Test
          </button>
        </div>
      )}

      {(isActive || isFinished) && (
        <>
          <div className="typing-display">
            {paragraph.split('').map((char, index) => (
              <span key={index} className={`char ${getCharacterClass(index)}`}>
                {char}
              </span>
            ))}
          </div>

          <textarea
            ref={inputRef}
            className="typing-input"
            value={userInput}
            onChange={handleInputChange}
            disabled={!isActive}
            placeholder={isActive ? "Start typing here..." : ""}
            rows={4}
          />
        </>
      )}

      {isFinished && (
        <div className="game-result">
          <h3>🎉 Test Complete!</h3>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-label">Words Per Minute</span>
              <span className="result-value">{wpm} WPM</span>
            </div>
            <div className="result-stat">
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
            <div className="result-stat highlight">
              <span className="result-label">Final Score</span>
              <span className="result-value">{Math.round(wpm * (accuracy / 100))}</span>
            </div>
          </div>
          <button onClick={reset} className="play-again-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingSpeedTest;
