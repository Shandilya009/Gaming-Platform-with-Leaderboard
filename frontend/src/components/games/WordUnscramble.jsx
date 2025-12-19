import { useState, useEffect } from 'react';
import './MiniGame.css';

const wordBank = [
  { word: 'COMPUTER', category: 'Technology' },
  { word: 'KEYBOARD', category: 'Technology' },
  { word: 'ELEPHANT', category: 'Animals' },
  { word: 'GIRAFFE', category: 'Animals' },
  { word: 'MOUNTAIN', category: 'Nature' },
  { word: 'BUTTERFLY', category: 'Animals' },
  { word: 'RAINBOW', category: 'Nature' },
  { word: 'CHOCOLATE', category: 'Food' },
  { word: 'SANDWICH', category: 'Food' },
  { word: 'GUITAR', category: 'Music' },
  { word: 'TRIANGLE', category: 'Shapes' },
  { word: 'DIAMOND', category: 'Shapes' },
  { word: 'PLANET', category: 'Space' },
  { word: 'ROCKET', category: 'Space' },
  { word: 'PYRAMID', category: 'History' },
  { word: 'DRAGON', category: 'Fantasy' },
  { word: 'CASTLE', category: 'Buildings' },
  { word: 'BRIDGE', category: 'Buildings' },
  { word: 'PENCIL', category: 'School' },
  { word: 'SCIENCE', category: 'School' }
];

const WordUnscramble = ({ onGameEnd }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [usedWords, setUsedWords] = useState([]);

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

  const scrambleWord = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    // Make sure it's actually scrambled
    return scrambled === word && word.length > 1 ? scrambleWord(word) : scrambled;
  };

  const getNewWord = () => {
    const availableWords = wordBank.filter(w => !usedWords.includes(w.word));
    if (availableWords.length === 0) {
      setUsedWords([]);
      return wordBank[Math.floor(Math.random() * wordBank.length)];
    }
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setUsedWords(prev => [...prev, word.word]);
    return word;
  };

  const startGame = () => {
    setIsActive(true);
    setScore(0);
    setFeedback('');
    setUsedWords([]);
    const word = getNewWord();
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word.word));
  };

  const endGame = () => {
    setIsActive(false);
    setIsFinished(true);
    if (onGameEnd) {
      onGameEnd({
        score: score,
        speedScore: Math.min(100, score * 10), // More words = faster
        accuracyScore: 100, // All submitted words are correct
        consistencyScore: Math.min(100, score * 15),
        timeTaken: 60
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer || !isActive) return;

    if (userAnswer.toUpperCase() === currentWord.word) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setTimeout(() => {
        setFeedback('');
        setUserAnswer('');
        const word = getNewWord();
        setCurrentWord(word);
        setScrambledWord(scrambleWord(word.word));
      }, 500);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback('');
      }, 500);
    }
  };

  const handleSkip = () => {
    if (!isActive) return;
    const word = getNewWord();
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word.word));
    setUserAnswer('');
    setFeedback('');
  };

  const reset = () => {
    setTimeLeft(60);
    setIsActive(false);
    setIsFinished(false);
    setCurrentWord(null);
    setScrambledWord('');
    setUserAnswer('');
    setScore(0);
    setFeedback('');
    setUsedWords([]);
  };

  return (
    <div className="mini-game word-unscramble-game">
      <div className="game-header">
        <h2>🔤 Word Unscramble</h2>
        <div className="game-stats">
          <div className="stat-box">
            <span className="stat-label">Time</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
      </div>

      {!isActive && !isFinished && (
        <div className="game-instructions">
          <p>Unscramble as many words as you can in 60 seconds!</p>
          <p className="instruction-detail">+1 point for each correct word</p>
          <button onClick={startGame} className="start-btn">
            Start Game
          </button>
        </div>
      )}

      {isActive && currentWord && (
        <div className={`word-scramble-container ${feedback}`}>
          <div className="word-category">
            <span className="category-label">Category:</span>
            <span className="category-value">{currentWord.category}</span>
          </div>
          <div className="scrambled-word">
            {scrambledWord.split('').map((letter, index) => (
              <span key={index} className="scrambled-letter">
                {letter}
              </span>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="word-answer-form">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              className="word-input"
              placeholder="Type the word"
              maxLength={scrambledWord.length}
              autoFocus
            />
            <div className="word-buttons">
              <button type="submit" className="submit-answer-btn">
                Submit
              </button>
              <button type="button" onClick={handleSkip} className="skip-btn">
                Skip
              </button>
            </div>
          </form>
          {feedback && (
            <div className={`feedback-message ${feedback}`}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again!'}
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="game-result">
          <h3>🎉 Game Over!</h3>
          <div className="result-stats">
            <div className="result-stat highlight">
              <span className="result-label">Words Unscrambled</span>
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

export default WordUnscramble;
