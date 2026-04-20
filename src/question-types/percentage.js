import { randomChoice } from '../random.js';

const FRIENDLY_PERCENTAGES = [10, 20, 25, 50, 75];
const FRIENDLY_BASES = [20, 40, 60, 80, 100, 120, 160, 200, 400];

export function generatePercentage() {
  const percentage = randomChoice(FRIENDLY_PERCENTAGES);
  const base = pickBaseDivisibleBy(percentage);
  const result = (percentage / 100) * base;

  return {
    question: `${percentage}% of ${base}`,
    answer: result.toString(),
    numericAnswer: result,
    operation: 'pct',
    operands: [percentage, base],
    type: 'percentage',
  };
}

function pickBaseDivisibleBy(percentage) {
  const candidates = FRIENDLY_BASES.filter(
    (base) => Number.isInteger((percentage / 100) * base),
  );
  return randomChoice(candidates.length ? candidates : FRIENDLY_BASES);
}
