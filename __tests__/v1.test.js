

import {   generateRandomMathQuestion,
  validateAnswer,
  checkIfSolvedCorrectly, } from '../index.js';


describe("Math Quiz Module", () => {
  test("should generate a valid math question", () => {
    const question = generateRandomMathQuestion();
    expect(question).toHaveProperty("question");
    expect(question).toHaveProperty("answer");
  });

  test("should validate the correct answer", () => {
    const question = { question: "10 + 5", answer: 15 };
    const result = validateAnswer(question, 15);
    expect(result).toBe(true);
  });

  test('should return "Correct!" if the user answers correctly', () => {
    const question = { question: "10 - 5", answer: 5 };
    const result = checkIfSolvedCorrectly(question, 5);
    expect(result).toBe(true);
  });

  test('should return "Wrong!" if the user answers incorrectly', () => {
    const question = { question: "10 * 5", answer: 50 };
    const result = checkIfSolvedCorrectly(question, 60);
    expect(result).toBe(false);
  });

  describe("Decimal answer validation", () => {
    test("accepts correctly rounded input for division", () => {
      const question = { question: "10 / 7", answer: "1.43" };
      expect(validateAnswer(question, "1.43")).toBe(true);
      expect(validateAnswer(question, "1.3948")).toBe(false); // 1.3948.toFixed(2) → '1.39'
    });

    test("rejects input that rounds to a different value", () => {
      const question = { question: "10 / 7", answer: "1.43" };
      expect(validateAnswer(question, "1.42")).toBe(false);
      expect(validateAnswer(question, "1.44")).toBe(false);
    });
  });

  describe("Whole-number division formatting", () => {
    test("accepts integer and truncated inputs when answer is a whole number", () => {
      const question = { question: "8 / 2", answer: "4.00" };
      expect(validateAnswer(question, "4")).toBe(true);
      expect(validateAnswer(question, "4.0")).toBe(true);
      expect(validateAnswer(question, "4.00")).toBe(true);
    });

    test("rejects off-by-one decimals", () => {
      const question = { question: "8 / 2", answer: "4.00" };
      expect(validateAnswer(question, "3.99")).toBe(false);
      expect(validateAnswer(question, "4.01")).toBe(false);
    });
  });

  describe("checkIfSolvedCorrectly wrapper for decimals", () => {
    test("correctly identifies correct decimal answers", () => {
      const question = { question: "10 / 4", answer: "2.50" };
      expect(checkIfSolvedCorrectly(question, "2.5")).toBe(true);
      expect(checkIfSolvedCorrectly(question, "2.50")).toBe(true);
    });

    test("identifies incorrect decimal answers", () => {
      const question = { question: "10 / 4", answer: "2.50" };
      expect(checkIfSolvedCorrectly(question, "2.49")).toBe(false);
      expect(checkIfSolvedCorrectly(question, "2.6")).toBe(false);
    });
  });

  describe("Invalid input handling", () => {
    test("validateAnswer returns false for non-numeric input", () => {
      const question = { question: "5 + 5", answer: "10" };
      expect(validateAnswer(question, "abc")).toBe(false);
      expect(validateAnswer(question, "")).toBe(false);
      expect(validateAnswer(question, null)).toBe(false);
      expect(validateAnswer(question, undefined)).toBe(false);
    });

    test("checkIfSolvedCorrectly wraps invalid inputs as false", () => {
      const question = { question: "5 + 5", answer: "10" };
      expect(checkIfSolvedCorrectly(question, "xyz")).toBe(false);
      expect(checkIfSolvedCorrectly(question, "")).toBe(false);
    });
  });
});

describe("Edge-Case Validation", () => {
  test("strict integer equality when no decimals expected", () => {
    const q = { question: "5 + 0", answer: "5" };
    // 4.6 would round to 5 if we did toFixed(0) → but we want false
    expect(validateAnswer(q, "4.6")).toBe(false);
    // '5.0' or '5.00' should also be rejected for integer answers
    expect(validateAnswer(q, "5.0")).toBe(false);
    expect(validateAnswer(q, "5.00")).toBe(false);
    // exact integer still works
    expect(validateAnswer(q, "5")).toBe(true);
  });

  test("rounding boundaries for halves", () => {
    const q = { question: "1 / 1", answer: "1.33" };
    // 1.334 → rounds down to '1.33'
    expect(validateAnswer(q, "1.334")).toBe(true);
    // 1.335 → rounds up to '1.34'
    expect(validateAnswer(q, "1.335")).toBe(false);
  });

  test("negative zero matches positive zero format", () => {
    const q = { question: "0 - 0", answer: "0.00" };
    // parseFloat('-0') is -0 but toFixed should normalize to '0.00'
    expect(validateAnswer(q, "-0")).toBe(true);
    // but a stray '-0.00' string shouldn't pass
    expect(validateAnswer(q, "-0.00")).toBe(false);
  });

  test("rejects malformed numeric strings", () => {
    const q = { question: "3 + 1.14", answer: "4.14" };
    expect(validateAnswer(q, "3.1.4")).toBe(false);
    expect(validateAnswer(q, "4,14")).toBe(false);
    expect(validateAnswer(q, "--5")).toBe(false);
    expect(validateAnswer(q, "   ")).toBe(false);
  });

  test("handles very large numbers without rounding glitches", () => {
    const big = "10000000000000000"; // 1e16
    const q = { question: "1e16 + 0", answer: big };
    expect(validateAnswer(q, big)).toBe(true);
    // adding a tiny fraction should fail
    expect(validateAnswer(q, "10000000000000000.1")).toBe(false);
  });
});

describe("Additional Validation Tests", () => {
  // --- Negative numbers ---
  test("accepts negative integer answers, rejects decimals", () => {
    const qInt = { question: "-3 + 0", answer: "-3" };
    expect(validateAnswer(qInt, "-3")).toBe(true);
    expect(validateAnswer(qInt, "-3.0")).toBe(false);
    expect(validateAnswer(qInt, "-2.9")).toBe(false);
  });

  test("rejects negative decimal answers even if they match expected", () => {
    const qDec = { question: "-5 / 2", answer: "-2.50" };
    // we currently forbid any negative input with a dot
    expect(validateAnswer(qDec, "-2.50")).toBe(false);
    expect(validateAnswer(qDec, "-2.5")).toBe(false);
  });

  // --- Zero handling ---
  test("zero answer formatting", () => {
    const qZeroInt = { question: "0 + 0", answer: "0" };
    expect(validateAnswer(qZeroInt, "0")).toBe(true);
    expect(validateAnswer(qZeroInt, "0.0")).toBe(false);
    const qZeroDec = { question: "0 / 1", answer: "0.00" };
    expect(validateAnswer(qZeroDec, "0")).toBe(true);
    expect(validateAnswer(qZeroDec, "0.00")).toBe(true);
  });

  // --- Rounding edge for long decimals ---
  test("manualRound half-up behavior on long inputs", () => {
    const q = { question: "1 / 3", answer: "0.33" };
    expect(validateAnswer(q, "0.3349")).toBe(true); // 0.3349 → 0.33
    expect(validateAnswer(q, "0.3350")).toBe(false); // 0.3350 → 0.34
    expect(validateAnswer(q, "0.3399")).toBe(false); // → 0.34
  });

  // --- Random generator sanity check ---
  test("generated question answer matches eval’d result", () => {
    for (let i = 0; i < 20; i++) {
      const q = generateRandomMathQuestion(3);
      // evaluate the question string
      // eslint-disable-next-line no-eval
      const raw = eval(q.question);
      if (q.question.includes("/")) {
        // division → 3 decimal places
        expect(q.answer).toBe(raw.toFixed(3));
        // and validateAnswer should accept it
        expect(validateAnswer(q, q.answer)).toBe(true);
      } else {
        expect(q.answer).toBe(String(raw));
        expect(validateAnswer(q, raw)).toBe(true);
      }
    }
  });
});
