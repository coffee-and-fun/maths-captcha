import { randomInt, randomChoice } from '../random.js';

const SEQUENCE_STYLES = ['arithmetic', 'geometric'];

export function generateSequence(config, options = {}) {
  const style = options.style ?? randomChoice(SEQUENCE_STYLES);
  return style === 'geometric'
    ? buildGeometric(config)
    : buildArithmetic(config);
}

function buildArithmetic(config) {
  const start = randomInt(1, 10);
  const step = randomInt(1, 9);
  const terms = [start, start + step, start + 2 * step, start + 3 * step];
  const next = start + 4 * step;

  return formatSequence(terms, next, [start, step], 'arithmetic');
}

function buildGeometric() {
  const start = randomInt(1, 4);
  const ratio = randomInt(2, 4);
  const terms = [
    start,
    start * ratio,
    start * ratio * ratio,
    start * ratio * ratio * ratio,
  ];
  const next = start * Math.pow(ratio, 4);

  return formatSequence(terms, next, [start, ratio], 'geometric');
}

function formatSequence(terms, next, operands, style) {
  return {
    question: `${terms.join(', ')}, ?`,
    answer: next.toString(),
    numericAnswer: next,
    operation: 'seq',
    operands,
    type: 'sequence',
    style,
  };
}
