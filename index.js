export {
  getConfig,
  setConfig,
  resetConfig,
  DEFAULT_CONFIG,
} from './src/config.js';

export {
  generateRandomMathQuestion,
  generateMultipleQuestions,
  generateQuestionWithConstraints,
  registerQuestionType,
  unregisterQuestionType,
  listQuestionTypes,
} from './src/generator.js';

export {
  validateAnswer,
  validateAnswerStrict,
  validateAnswerFlexible,
  validateAnswerWithFeedback,
  validateAnswers,
  checkIfSolvedCorrectly,
} from './src/validator.js';

export { getQuestionStats, calculateDifficulty } from './src/stats.js';

export { normalizeNumericString } from './src/formatter.js';
