import { snapshotConfig } from './config.js';
import { randomChoice } from './random.js';
import { generateArithmetic } from './question-types/arithmetic.js';
import { generatePower } from './question-types/power.js';
import { generatePercentage } from './question-types/percentage.js';
import { generatePemdas } from './question-types/pemdas.js';
import { generateSolveForX } from './question-types/solve-x.js';
import { generateSequence } from './question-types/sequence.js';

const BUILTIN_GENERATORS = {
  arithmetic: generateArithmetic,
  power: generatePower,
  percentage: generatePercentage,
  pemdas: generatePemdas,
  'solve-x': generateSolveForX,
  sequence: generateSequence,
};

const customGenerators = new Map();

export function registerQuestionType(name, generator) {
  if (typeof name !== 'string' || !name) {
    throw new Error('Question type name must be a non-empty string');
  }
  if (typeof generator !== 'function') {
    throw new Error('Question type generator must be a function');
  }
  customGenerators.set(name, generator);
}

export function unregisterQuestionType(name) {
  customGenerators.delete(name);
}

export function listQuestionTypes() {
  return [
    ...Object.keys(BUILTIN_GENERATORS),
    ...customGenerators.keys(),
  ];
}

export function generateRandomMathQuestion(precisionOrConfig) {
  const overrides = normalizeOverrides(precisionOrConfig);
  const config = snapshotConfig(overrides);
  const type = randomChoice(config.QUESTION_TYPES);
  const generator = resolveGenerator(type);
  return generator(config);
}

export function generateMultipleQuestions(count = 1, precisionOrConfig) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateRandomMathQuestion(precisionOrConfig));
  }
  return questions;
}

export function generateQuestionWithConstraints(constraints = {}) {
  const {
    operations,
    numberRange,
    maxResult = Infinity,
    minResult = -Infinity,
    precision,
    questionTypes,
  } = constraints;

  const overrides = {};
  if (operations) overrides.OPERATIONS = operations;
  if (numberRange) overrides.NUMBER_RANGE = numberRange;
  if (precision !== undefined) overrides.DIVISION_PRECISION = precision;
  if (questionTypes) overrides.QUESTION_TYPES = questionTypes;

  const config = snapshotConfig(overrides);
  const constraintAttempts = Math.max(config.MAX_ATTEMPTS, 100);

  for (let attempt = 0; attempt < constraintAttempts; attempt++) {
    const type = randomChoice(config.QUESTION_TYPES);
    const generator = resolveGenerator(type);
    const question = generator(config);
    const result = question.numericAnswer;

    if (result >= minResult && result <= maxResult) {
      return question;
    }
  }

  throw new Error('Could not generate question within constraints');
}

function resolveGenerator(type) {
  const generator = customGenerators.get(type) ?? BUILTIN_GENERATORS[type];
  if (!generator) {
    throw new Error(`Unknown question type: ${type}`);
  }
  return generator;
}

function normalizeOverrides(precisionOrConfig) {
  if (precisionOrConfig === undefined || precisionOrConfig === null) {
    return {};
  }
  if (typeof precisionOrConfig === 'number') {
    return { DIVISION_PRECISION: precisionOrConfig };
  }
  if (typeof precisionOrConfig === 'object') {
    return precisionOrConfig;
  }
  return {};
}
