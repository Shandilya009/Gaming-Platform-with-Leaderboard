/**
 * Score Calculator Utility
 * Centralized score calculation logic for transparency and consistency
 */

// Weightage configuration
export const SCORE_WEIGHTS = {
  speed: 0.4,      // 40% weight for speed
  accuracy: 0.4,   // 40% weight for accuracy
  consistency: 0.2 // 20% weight for consistency
};

// Difficulty multipliers
export const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5
};

/**
 * Calculate final score from raw metrics
 * @param {Object} metrics - Raw gameplay metrics
 * @param {number} metrics.speedScore - Speed score (0-100)
 * @param {number} metrics.accuracyScore - Accuracy score (0-100)
 * @param {number} metrics.consistencyScore - Consistency score (0-100)
 * @param {string} difficulty - Game difficulty (easy/medium/hard)
 * @returns {number} - Computed final score (rounded)
 */
export const calculateFinalScore = (metrics, difficulty = 'medium') => {
  const { speedScore = 0, accuracyScore = 0, consistencyScore = 0 } = metrics;
  
  // Validate inputs (clamp to 0-100 range)
  const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
  
  const validSpeed = clamp(speedScore);
  const validAccuracy = clamp(accuracyScore);
  const validConsistency = clamp(consistencyScore);
  
  // Calculate weighted score
  const weightedScore = 
    (validSpeed * SCORE_WEIGHTS.speed) +
    (validAccuracy * SCORE_WEIGHTS.accuracy) +
    (validConsistency * SCORE_WEIGHTS.consistency);
  
  // Apply difficulty multiplier
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const finalScore = weightedScore * multiplier;
  
  // Round to nearest integer
  return Math.round(finalScore);
};

/**
 * Calculate metrics from raw game data
 * Different games may have different ways to calculate these metrics
 * @param {Object} gameData - Raw game completion data
 * @param {string} gameType - Type of game (speed, logic, puzzle, etc.)
 * @returns {Object} - Calculated metrics
 */
export const calculateMetricsFromGameData = (gameData, gameType) => {
  const { score = 0, timeTaken = 0, maxTime = 60, correctAnswers = 0, totalQuestions = 0, attempts = 1 } = gameData;
  
  let speedScore = 0;
  let accuracyScore = 0;
  let consistencyScore = 0;
  
  switch (gameType) {
    case 'speed':
      // Speed games: faster = better
      speedScore = maxTime && timeTaken ? Math.min(100, ((maxTime - timeTaken) / maxTime) * 100 + 50) : 70;
      accuracyScore = score ? Math.min(100, score) : 50;
      consistencyScore = 70; // Default for speed games
      break;
      
    case 'logic':
      // Logic games: accuracy matters most
      accuracyScore = totalQuestions ? (correctAnswers / totalQuestions) * 100 : Math.min(100, score * 2);
      speedScore = maxTime && timeTaken ? Math.min(100, ((maxTime - timeTaken) / maxTime) * 100 + 30) : 60;
      consistencyScore = attempts ? Math.max(0, 100 - (attempts - 1) * 10) : 80;
      break;
      
    case 'puzzle':
      // Puzzle games: accuracy and consistency
      accuracyScore = totalQuestions ? (correctAnswers / totalQuestions) * 100 : Math.min(100, score * 2);
      consistencyScore = attempts ? Math.max(0, 100 - (attempts - 1) * 15) : 75;
      speedScore = maxTime && timeTaken ? Math.min(100, ((maxTime - timeTaken) / maxTime) * 100 + 20) : 50;
      break;
      
    case 'memory':
      // Memory games: accuracy and consistency
      accuracyScore = totalQuestions ? (correctAnswers / totalQuestions) * 100 : Math.min(100, score * 3);
      consistencyScore = attempts ? Math.max(0, 100 - (attempts - 1) * 15) : 75;
      speedScore = maxTime && timeTaken ? Math.min(100, ((maxTime - timeTaken) / maxTime) * 100 + 20) : 50;
      break;
      
    case 'reflex':
      // Reflex games: speed is everything
      speedScore = score ? Math.min(100, score) : 50;
      accuracyScore = 80; // Default high accuracy for reflex
      consistencyScore = 70;
      break;
      
    default:
      // Default calculation based on score
      speedScore = Math.min(100, score * 0.8);
      accuracyScore = Math.min(100, score * 1.2);
      consistencyScore = 70;
  }
  
  return {
    speedScore: Math.round(Math.max(0, Math.min(100, speedScore))),
    accuracyScore: Math.round(Math.max(0, Math.min(100, accuracyScore))),
    consistencyScore: Math.round(Math.max(0, Math.min(100, consistencyScore)))
  };
};

/**
 * Get score breakdown for display
 * @param {Object} score - Score document
 * @returns {Object} - Formatted breakdown for UI
 */
export const getScoreBreakdown = (score) => {
  const speedVal = score.speedScore || 0;
  const accuracyVal = score.accuracyScore || 0;
  const consistencyVal = score.consistencyScore || 0;
  
  return {
    speed: {
      value: speedVal,
      weight: SCORE_WEIGHTS.speed * 100,
      contribution: Math.round(speedVal * SCORE_WEIGHTS.speed)
    },
    accuracy: {
      value: accuracyVal,
      weight: SCORE_WEIGHTS.accuracy * 100,
      contribution: Math.round(accuracyVal * SCORE_WEIGHTS.accuracy)
    },
    consistency: {
      value: consistencyVal,
      weight: SCORE_WEIGHTS.consistency * 100,
      contribution: Math.round(consistencyVal * SCORE_WEIGHTS.consistency)
    },
    total: score.finalScore || score.score || 0
  };
};

/**
 * Calculate skill impact from scores
 * @param {Array} scores - Array of user's scores
 * @returns {Object} - Skill impact metrics
 */
export const calculateSkillImpact = (scores) => {
  if (!scores || scores.length === 0) {
    return {
      focus: 0,
      reflex: 0,
      accuracy: 0,
      consistency: 0
    };
  }
  
  const avgSpeed = scores.reduce((sum, s) => sum + (s.speedScore || 0), 0) / scores.length;
  const avgAccuracy = scores.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / scores.length;
  const avgConsistency = scores.reduce((sum, s) => sum + (s.consistencyScore || 0), 0) / scores.length;
  
  return {
    focus: Math.round((avgAccuracy + avgConsistency) / 2),
    reflex: Math.round(avgSpeed),
    accuracy: Math.round(avgAccuracy),
    consistency: Math.round(avgConsistency)
  };
};

export default {
  calculateFinalScore,
  calculateMetricsFromGameData,
  getScoreBreakdown,
  calculateSkillImpact,
  SCORE_WEIGHTS,
  DIFFICULTY_MULTIPLIERS
};
