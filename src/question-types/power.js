import { randomInt, randomChoice } from '../random.js';

const POWER_STYLES = ['square', 'cube', 'sqrt'];

export function generatePower(config, options = {}) {
  const style = options.style ?? randomChoice(POWER_STYLES);

  if (style === 'square') return buildSquare();
  if (style === 'cube') return buildCube();
  return buildSquareRoot();
}

function buildSquare() {
  const base = randomInt(2, 12);
  const result = base * base;
  return {
    question: `${base}^2`,
    answer: result.toString(),
    numericAnswer: result,
    operation: '^',
    operands: [base, 2],
    type: 'power',
    style: 'square',
  };
}

function buildCube() {
  const base = randomInt(2, 6);
  const result = base * base * base;
  return {
    question: `${base}^3`,
    answer: result.toString(),
    numericAnswer: result,
    operation: '^',
    operands: [base, 3],
    type: 'power',
    style: 'cube',
  };
}

function buildSquareRoot() {
  const root = randomInt(2, 15);
  const radicand = root * root;
  return {
    question: `√${radicand}`,
    answer: root.toString(),
    numericAnswer: root,
    operation: '√',
    operands: [radicand],
    type: 'power',
    style: 'sqrt',
  };
}
