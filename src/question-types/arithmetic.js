import { randomInt, randomChoice, randomIntInRange } from '../random.js';

const OPERATION_FUNCTIONS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '%': (a, b) => a % b,
};

export const SUPPORTED_OPERATIONS = Object.keys(OPERATION_FUNCTIONS);

export function generateArithmetic(config) {
  const allowedOperations = config.OPERATIONS.filter((op) =>
    SUPPORTED_OPERATIONS.includes(op),
  );
  const operations = allowedOperations.length
    ? allowedOperations
    : ['+', '-', '*', '/'];

  for (let attempt = 0; attempt < config.MAX_ATTEMPTS; attempt++) {
    const candidate = buildCandidate(operations, config);
    if (candidate) return candidate;
  }

  return buildSafeAddition(config);
}

function buildCandidate(operations, config) {
  let num1 = randomIntInRange(config.NUMBER_RANGE);
  let num2 = randomIntInRange(config.NUMBER_RANGE);
  const operation = randomChoice(operations);

  if (operation === '-' && config.AVOID_NEGATIVE_RESULTS && num1 < num2) {
    [num1, num2] = [num2, num1];
  }

  if (operation === '/' && config.AVOID_DIVISION_BY_ZERO && num2 === 0) {
    return null;
  }

  if (operation === '%' && num2 === 0) {
    return null;
  }

  const compute = OPERATION_FUNCTIONS[operation];
  const numericResult = compute(num1, num2);

  if (config.AVOID_NEGATIVE_RESULTS && numericResult < 0) {
    return null;
  }

  const formattedAnswer =
    operation === '/'
      ? numericResult.toFixed(config.DIVISION_PRECISION)
      : numericResult.toString();

  return {
    question: `${num1} ${operation} ${num2}`,
    answer: formattedAnswer,
    numericAnswer: numericResult,
    operation,
    operands: [num1, num2],
    type: 'arithmetic',
  };
}

function buildSafeAddition(config) {
  const num1 = randomInt(1, 10);
  const num2 = randomInt(1, 10);
  const result = num1 + num2;
  return {
    question: `${num1} + ${num2}`,
    answer: result.toString(),
    numericAnswer: result,
    operation: '+',
    operands: [num1, num2],
    type: 'arithmetic',
  };
}
