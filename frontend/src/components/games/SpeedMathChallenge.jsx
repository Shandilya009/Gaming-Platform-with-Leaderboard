import { useState, useEffect } from 'react';
import './MiniGame.css';

const SpeedMathChallenge = ({ onGameEnd }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState('');

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

  const generateQuestion = () => {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    return {
      num1,
      num2,
      operation,
      answer
    };
  };

  const startGame = () => {
    setIsActive(true);
    setCorrect(0);
    setIncorrect(0);
    setFeedback('');
    setQuestion(generateQuestion());
  };

  const endGame = () => {
    setIsActive(false);
    setIsFinished(true);
    const finalScore = Math.max(0, Math.round(correct - (incorrect * 0.25)));
    const total = correct + incorrect;
    const accuracyVal = total > 0 ? Math.round((correct / total) * 100) : 0;
    if (onGameEnd) {
      onGameEnd({
        score: finalScore,
        speedScore: Math.min(100, correct * 5), // More correct = faster
        accuracyScore: accuracyVal,
        consistencyScore: Math.max(0, 100 - incorrect * 10),
        timeTaken: 60
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer || !isActive) return;

    const answer = parseInt(userAnswer);
    if (answer === question.answer) {
      setCorrect(prev => prev + 1);
      setFeedback('correct');
    } else {
      setIncorrect(prev => prev + 1);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback('');
      setUserAnswer('');
      setQuestion(generateQuestion());
    }, 300);
  };

  const reset = () => {
    setTimeLeft(60);
    setIsActive(false);
    setIsFinished(false);
    setQuestion(null);
    setUserAnswer('');
    setCorrect(0);
    setIncorrect(0);
    setFeedback('');
  };

  const currentScore = Math.max(0, Math.round(correct - (incorrect * 0.25)));

  return (
    <div className="mini-game math-challenge-game">
      <div className="game-header">
        <h2>🧮 Speed Math Challenge</h2>
        <div className="game-stats">
          <div className="stat-box">
            <span className="stat-label">Time</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-box correct">
            <span className="stat-label">Correct</span>
            <span className="stat-value">{correct}</span>
          </div>
          <div className="stat-box incorrect">
            <span className="stat-label">Wrong</span>
            <span className="stat-value">{incorrect}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Score</span>
            <span className="stat-value">{currentScore}</span>
          </div>
        </div>
      </div>

      {!isActive && !isFinished && (
        <div className="game-instructions">
          <p>Solve as many math problems as you can in 60 seconds!</p>
          <p className="instruction-detail">Correct: +1 point | Wrong: -0.25 points</p>
          <button onClick={startGame} className="start-btn">
            Start Challenge
          </button>
        </div>
      )}

      {isActive && question && (
        <div className={`math-question-container ${feedback}`}>
          <div className="math-question">
            <span className="math-number">{question.num1}</span>
            <span className="math-operator">{question.operation}</span>
            <span className="math-number">{question.num2}</span>
            <span className="math-equals">=</span>
            <span className="math-answer">?</span>
          </div>
          <form onSubmit={handleSubmit} className="math-answer-form">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="math-input"
              placeholder="Your answer"
              autoFocus
            />
            <button type="submit" className="submit-answer-btn">
              Submit
            </button>
          </form>
          {feedback && (
            <div className={`feedback-message ${feedback}`}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="game-result">
          <h3>🎉 Challenge Complete!</h3>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-label">Correct Answers</span>
              <span className="result-value">{correct}</span>
            </div>
            <div className="result-stat">
              <span className="result-label">Wrong Answers</span>
              <span className="result-value">{incorrect}</span>
            </div>
            <div className="result-stat highlight">
              <span className="result-label">Final Score</span>
              <span className="result-value">{currentScore}</span>
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

export default SpeedMathChallenge;
