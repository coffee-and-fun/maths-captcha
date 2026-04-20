import { randomInt, randomChoice } from '../random.js';

const SAFE_OPERATIONS = ['+', '-', '*'];
const COMPUTE = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
};

export function generatePemdas(config) {
  const useParentheses = Math.random() < 0.4;
  const num1 = randomInt(2, 12);
  const num2 = randomInt(2, 12);
  const num3 = randomInt(2, 12);
  const op1 = randomChoice(SAFE_OPERATIONS);
  const op2 = randomChoice(SAFE_OPERATIONS);

  const { question, answer } = useParentheses
    ? buildParenthesized(num1, op1, num2, op2, num3)
    : buildPrecedence(num1, op1, num2, op2, num3);

  if (config.AVOID_NEGATIVE_RESULTS && answer < 0) {
    return generatePemdas(config);
  }

  return {
    question,
    answer: answer.toString(),
    numericAnswer: answer,
    operation: 'expr',
    operands: [num1, num2, num3],
    type: 'pemdas',
  };
}

function buildPrecedence(num1, op1, num2, op2, num3) {
  const op1IsHigher = op1 === '*';
  const op2IsHigher = op2 === '*';

  let answer;
  if (op1IsHigher && !op2IsHigher) {
    answer = COMPUTE[op2](COMPUTE[op1](num1, num2), num3);
  } else if (!op1IsHigher && op2IsHigher) {
    answer = COMPUTE[op1](num1, COMPUTE[op2](num2, num3));
  } else {
    answer = COMPUTE[op2](COMPUTE[op1](num1, num2), num3);
  }

  return {
    question: `${num1} ${op1} ${num2} ${op2} ${num3}`,
    answer,
  };
}

function buildParenthesized(num1, op1, num2, op2, num3) {
  const wrapLeft = Math.random() < 0.5;
  if (wrapLeft) {
    return {
      question: `(${num1} ${op1} ${num2}) ${op2} ${num3}`,
      answer: COMPUTE[op2](COMPUTE[op1](num1, num2), num3),
    };
  }
  return {
    question: `${num1} ${op1} (${num2} ${op2} ${num3})`,
    answer: COMPUTE[op1](num1, COMPUTE[op2](num2, num3)),
  };
}
