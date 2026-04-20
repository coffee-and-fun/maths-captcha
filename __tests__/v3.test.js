import {
  generateRandomMathQuestion,
  generateMultipleQuestions,
  generateQuestionWithConstraints,
  registerQuestionType,
  unregisterQuestionType,
  listQuestionTypes,
  validateAnswer,
  validateAnswerFlexible,
  validateAnswerWithFeedback,
  setConfig,
  resetConfig,
  getConfig,
} from '../index.js';

afterEach(() => {
  resetConfig();
});

describe("v3 — Question type registry", () => {
  test("listQuestionTypes returns all built-in types", () => {
    const types = listQuestionTypes();
    expect(types).toEqual(
      expect.arrayContaining([
        'arithmetic',
        'power',
        'percentage',
        'pemdas',
        'solve-x',
        'sequence',
      ]),
    );
  });

  test("default config still produces only arithmetic questions", () => {
    for (let i = 0; i < 20; i++) {
      const question = generateRandomMathQuestion();
      expect(question.type).toBe('arithmetic');
    }
  });

  test("registerQuestionType allows custom generators", () => {
    registerQuestionType('always-42', () => ({
      question: 'What is the answer to life?',
      answer: '42',
      numericAnswer: 42,
      operation: 'meta',
      operands: [],
      type: 'always-42',
    }));

    setConfig({ QUESTION_TYPES: ['always-42'] });
    const question = generateRandomMathQuestion();
    expect(question.answer).toBe('42');
    expect(validateAnswer(question, '42')).toBe(true);

    unregisterQuestionType('always-42');
  });

  test("unknown question type throws clearly", () => {
    setConfig({ QUESTION_TYPES: ['nonexistent'] });
    expect(() => generateRandomMathQuestion()).toThrow(/Unknown question type/);
  });

  test("registerQuestionType validates inputs", () => {
    expect(() => registerQuestionType('', () => ({}))).toThrow();
    expect(() => registerQuestionType('foo', null)).toThrow();
  });
});

describe("v3 — Power questions", () => {
  beforeEach(() => setConfig({ QUESTION_TYPES: ['power'] }));

  test("generates squares with correct answers", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      expect(question.type).toBe('power');

      if (question.style === 'square') {
        const [base] = question.operands;
        expect(question.numericAnswer).toBe(base * base);
        expect(question.question).toBe(`${base}^2`);
      }
    }
  });

  test("generates cubes with correct answers", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      if (question.style === 'cube') {
        const [base] = question.operands;
        expect(question.numericAnswer).toBe(base ** 3);
      }
    }
  });

  test("generates square roots of perfect squares with integer answers", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      if (question.style === 'sqrt') {
        const [radicand] = question.operands;
        expect(question.numericAnswer).toBe(Math.sqrt(radicand));
        expect(Number.isInteger(question.numericAnswer)).toBe(true);
      }
    }
  });

  test("validates power answers correctly", () => {
    const question = generateRandomMathQuestion();
    expect(validateAnswer(question, question.answer)).toBe(true);
    expect(validateAnswer(question, String(question.numericAnswer + 1))).toBe(false);
  });
});

describe("v3 — Percentage questions", () => {
  beforeEach(() => setConfig({ QUESTION_TYPES: ['percentage'] }));

  test("generates X% of Y with integer results", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      expect(question.type).toBe('percentage');
      expect(question.question).toMatch(/^\d+% of \d+$/);
      expect(Number.isInteger(question.numericAnswer)).toBe(true);
    }
  });

  test("answer matches mathematical computation", () => {
    for (let i = 0; i < 20; i++) {
      const question = generateRandomMathQuestion();
      const [percentage, base] = question.operands;
      expect(question.numericAnswer).toBe((percentage / 100) * base);
      expect(validateAnswer(question, question.answer)).toBe(true);
    }
  });
});

describe("v3 — PEMDAS questions", () => {
  beforeEach(() => setConfig({ QUESTION_TYPES: ['pemdas'] }));

  test("generates 3-operand expressions", () => {
    for (let i = 0; i < 20; i++) {
      const question = generateRandomMathQuestion();
      expect(question.type).toBe('pemdas');
      expect(question.operands).toHaveLength(3);
    }
  });

  test("answer is computed respecting operator precedence", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      // eslint-disable-next-line no-eval
      const evaluated = eval(question.question);
      expect(question.numericAnswer).toBe(evaluated);
      expect(validateAnswer(question, question.answer)).toBe(true);
    }
  });
});

describe("v3 — Solve for x", () => {
  beforeEach(() => setConfig({ QUESTION_TYPES: ['solve-x'] }));

  test("generates linear equations of form ax + b = c", () => {
    for (let i = 0; i < 20; i++) {
      const question = generateRandomMathQuestion();
      expect(question.type).toBe('solve-x');
      expect(question.question).toMatch(/^\d+x [+\-] \d+ = -?\d+$/);
    }
  });

  test("the stated answer satisfies the equation", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      const [a, b, c] = question.operands;
      const x = question.numericAnswer;
      const sign = question.question.includes('+') ? 1 : -1;
      expect(a * x + sign * b).toBe(c);
      expect(validateAnswer(question, String(x))).toBe(true);
    }
  });
});

describe("v3 — Sequence questions", () => {
  beforeEach(() => setConfig({ QUESTION_TYPES: ['sequence'] }));

  test("arithmetic sequences continue with constant step", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      if (question.style === 'arithmetic') {
        const [start, step] = question.operands;
        expect(question.numericAnswer).toBe(start + 4 * step);
      }
    }
  });

  test("geometric sequences continue with constant ratio", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      if (question.style === 'geometric') {
        const [start, ratio] = question.operands;
        expect(question.numericAnswer).toBe(start * Math.pow(ratio, 4));
      }
    }
  });

  test("question shows four terms then a placeholder", () => {
    const question = generateRandomMathQuestion();
    expect(question.question).toMatch(/^(\d+, ){4}\?$/);
  });
});

describe("v3 — Mixed question types", () => {
  test("config can enable multiple types together", () => {
    setConfig({ QUESTION_TYPES: ['arithmetic', 'power', 'percentage'] });
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      seen.add(generateRandomMathQuestion().type);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  test("generateMultipleQuestions respects active types", () => {
    setConfig({ QUESTION_TYPES: ['power'] });
    const questions = generateMultipleQuestions(10);
    questions.forEach((q) => expect(q.type).toBe('power'));
  });

  test("generateQuestionWithConstraints accepts questionTypes override", () => {
    const question = generateQuestionWithConstraints({
      questionTypes: ['solve-x'],
    });
    expect(question.type).toBe('solve-x');
  });
});

describe("v3 — Modulo operation in arithmetic", () => {
  test("respects modulo when added to OPERATIONS", () => {
    setConfig({ OPERATIONS: ['%'] });
    let foundModulo = false;
    for (let i = 0; i < 30; i++) {
      const question = generateRandomMathQuestion();
      if (question.operation === '%') {
        foundModulo = true;
        const [a, b] = question.operands;
        expect(question.numericAnswer).toBe(a % b);
      }
    }
    expect(foundModulo).toBe(true);
  });
});

describe("v3 — Bug fixes", () => {
  test("generateQuestionWithConstraints does not leak config mutation", () => {
    const before = getConfig();
    try {
      generateQuestionWithConstraints({
        operations: ['+'],
        numberRange: { min: 1, max: 5 },
      });
    } catch {
      // ignore — we only care about config state
    }
    const after = getConfig();
    expect(after.OPERATIONS).toEqual(before.OPERATIONS);
    expect(after.NUMBER_RANGE).toEqual(before.NUMBER_RANGE);
  });

  test("validateAnswerWithFeedback does not crash on null/undefined", () => {
    const question = { question: '5 + 5', answer: '10', numericAnswer: 10, operation: '+' };
    expect(() => {
      const result = validateAnswerWithFeedback(question, null);
      expect(result.isValid).toBe(false);
    }).not.toThrow();
  });
});
