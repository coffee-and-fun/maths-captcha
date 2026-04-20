import { randomInt, randomChoice } from '../random.js';

export function generateSolveForX(config) {
  const coefficient = randomInt(2, 9);
  const x = randomInt(1, 10);
  const constant = randomInt(1, 20);
  const sign = config.AVOID_NEGATIVE_RESULTS
    ? '+'
    : randomChoice(['+', '-']);

  const rightSide =
    sign === '+'
      ? coefficient * x + constant
      : coefficient * x - constant;

  return {
    question: `${coefficient}x ${sign} ${constant} = ${rightSide}`,
    answer: x.toString(),
    numericAnswer: x,
    operation: 'solve',
    operands: [coefficient, constant, rightSide],
    type: 'solve-x',
  };
}
