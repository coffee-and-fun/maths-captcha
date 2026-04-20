const OPERATION_DIFFICULTY = {
  '+': 1,
  '-': 2,
  '*': 3,
  '/': 4,
  '%': 4,
  '^': 5,
  '√': 5,
  expr: 6,
  pct: 4,
  solve: 7,
  seq: 6,
};

export function getQuestionStats(question) {
  const [num1, num2] = question.operands;
  const result = question.numericAnswer;

  return {
    operands: { num1, num2 },
    result,
    operation: question.operation,
    difficulty: calculateDifficulty(question),
    hasDecimals:
      question.operation === '/' ||
      (typeof result === 'number' && !Number.isInteger(result)),
  };
}

export function calculateDifficulty(question) {
  const operands = question.operands ?? [];
  const { operation } = question;

  let score = 1;
  score += OPERATION_DIFFICULTY[operation] ?? 1;

  const numericOperands = operands.filter((value) => typeof value === 'number');
  const maxOperand = numericOperands.length
    ? Math.max(...numericOperands.map(Math.abs))
    : 0;
  if (maxOperand > 50) score += 2;
  else if (maxOperand > 20) score += 1;

  const answerHasDecimal =
    typeof question.answer === 'string' && question.answer.includes('.');
  if (operation === '/' && answerHasDecimal) score += 2;

  if (typeof question.numericAnswer === 'number' && question.numericAnswer > 100) {
    score += 1;
  }

  return Math.min(score, 10);
}
