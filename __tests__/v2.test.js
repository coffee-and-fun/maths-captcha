import {
  generateRandomMathQuestion,
  generateMultipleQuestions,
  generateQuestionWithConstraints,
  validateAnswer,
  validateAnswerFlexible,
  validateAnswerWithFeedback,
  validateAnswers,
  validateAnswerStrict,
  checkIfSolvedCorrectly,
  getQuestionStats,
  setConfig,
  getConfig,
  normalizeNumericString
} from '../index.js';

describe("Math Captcha v2.0 - Core Functions", () => {
  
  describe("generateRandomMathQuestion", () => {
    test("should generate a valid math question with all required properties", () => {
      const question = generateRandomMathQuestion();
      expect(question).toHaveProperty("question");
      expect(question).toHaveProperty("answer");
      expect(question).toHaveProperty("numericAnswer");
      expect(question).toHaveProperty("operation");
      expect(question).toHaveProperty("operands");
      expect(Array.isArray(question.operands)).toBe(true);
      expect(question.operands).toHaveLength(2);
    });

    test("should respect precision parameter for division", () => {
      const question = generateRandomMathQuestion(3);
      if (question.operation === '/') {
        expect(question.answer).toMatch(/^\d+\.\d{3}$/);
      }
    });

    test("should avoid negative results when configured", () => {
      setConfig({ AVOID_NEGATIVE_RESULTS: true });
      for (let i = 0; i < 50; i++) {
        const question = generateRandomMathQuestion();
        expect(question.numericAnswer).toBeGreaterThanOrEqual(0);
      }
    });

    test("should avoid division by zero", () => {
      setConfig({ AVOID_DIVISION_BY_ZERO: true });
      for (let i = 0; i < 50; i++) {
        const question = generateRandomMathQuestion();
        if (question.operation === '/') {
          expect(question.operands[1]).not.toBe(0);
        }
      }
    });
  });

  describe("generateMultipleQuestions", () => {
    test("should generate specified number of questions", () => {
      const questions = generateMultipleQuestions(5);
      expect(questions).toHaveLength(5);
      questions.forEach(q => {
        expect(q).toHaveProperty("question");
        expect(q).toHaveProperty("answer");
      });
    });

    test("should handle edge cases", () => {
      expect(generateMultipleQuestions(0)).toHaveLength(0);
      expect(generateMultipleQuestions(1)).toHaveLength(1);
    });
  });

  describe("generateQuestionWithConstraints", () => {
    test("should respect operation constraints", () => {
      const question = generateQuestionWithConstraints({
        operations: ['+', '-']
      });
      expect(['+', '-']).toContain(question.operation);
    });

    test("should respect number range constraints", () => {
      const question = generateQuestionWithConstraints({
        numberRange: { min: 1, max: 10 }
      });
      expect(question.operands[0]).toBeGreaterThanOrEqual(1);
      expect(question.operands[0]).toBeLessThanOrEqual(10);
      expect(question.operands[1]).toBeGreaterThanOrEqual(1);
      expect(question.operands[1]).toBeLessThanOrEqual(10);
    });

    test("should respect result bounds", () => {
      const question = generateQuestionWithConstraints({
        operations: ['+'],
        maxResult: 50
      });
      expect(question.numericAnswer).toBeLessThanOrEqual(50);
    });

    test("should throw error when constraints cannot be met", () => {
      expect(() => {
        generateQuestionWithConstraints({
          operations: ['+'],
          numberRange: { min: 100, max: 200 },
          maxResult: 50
        });
      }).toThrow('Could not generate question within constraints');
    });
  });
});

describe("Validation Functions", () => {
  
  describe("validateAnswer (strict mode - backward compatibility)", () => {
    test("should validate correct answers", () => {
      const question = { question: "10 + 5", answer: "15" };
      expect(validateAnswer(question, "15")).toBe(true);
      expect(validateAnswer(question, 15)).toBe(true);
    });

    test("should reject incorrect answers", () => {
      const question = { question: "10 + 5", answer: "15" };
      expect(validateAnswer(question, "16")).toBe(false);
      expect(validateAnswer(question, 16)).toBe(false);
    });

    test("should handle null/undefined inputs", () => {
      const question = { question: "5 + 5", answer: "10" };
      expect(validateAnswer(question, null)).toBe(false);
      expect(validateAnswer(question, undefined)).toBe(false);
    });

    test("should reject malformed numeric strings", () => {
      const question = { question: "3 + 1", answer: "4" };
      expect(validateAnswer(question, "3.1.4")).toBe(false);
      expect(validateAnswer(question, "4,14")).toBe(false);
      expect(validateAnswer(question, "--5")).toBe(false);
      expect(validateAnswer(question, "   ")).toBe(false);
      expect(validateAnswer(question, "abc")).toBe(false);
    });

    test("should enforce strict integer validation", () => {
      const question = { question: "5 + 0", answer: "5" };
      expect(validateAnswer(question, "5")).toBe(true);
      expect(validateAnswer(question, "5.0")).toBe(false);
      expect(validateAnswer(question, "5.00")).toBe(false);
      expect(validateAnswer(question, "4.6")).toBe(false);
    });

    test("should handle decimal answers with rounding", () => {
      const question = { question: "10 / 7", answer: "1.43" };
      expect(validateAnswer(question, "1.43")).toBe(true);
      expect(validateAnswer(question, "1.434")).toBe(true); // rounds to 1.43
      expect(validateAnswer(question, "1.435")).toBe(false); // rounds to 1.44
    });

    test("should reject negative decimals", () => {
      const question = { question: "-5 / 2", answer: "-2.50" };
      expect(validateAnswer(question, "-2.50")).toBe(false);
      expect(validateAnswer(question, "-2.5")).toBe(false);
    });

    test("should handle zero correctly", () => {
      const question = { question: "0 / 1", answer: "0.00" };
      expect(validateAnswer(question, "0")).toBe(true);
      expect(validateAnswer(question, "0.00")).toBe(true);
      expect(validateAnswer(question, "-0")).toBe(true);
      expect(validateAnswer(question, "-0.00")).toBe(false);
    });
  });

  describe("validateAnswerFlexible (enhanced mode)", () => {
    test("should accept flexible decimal representations", () => {
      const question = { 
        question: "8 / 2", 
        answer: "4.00",
        numericAnswer: 4.0,
        operation: "/"
      };
      expect(validateAnswerFlexible(question, "4")).toBe(true);
      expect(validateAnswerFlexible(question, "4.0")).toBe(true);
      expect(validateAnswerFlexible(question, "4.00")).toBe(true);
      expect(validateAnswerFlexible(question, "4.000")).toBe(true);
    });

    test("should handle non-division operations flexibly", () => {
      const question = { 
        question: "10 + 5", 
        answer: "15",
        numericAnswer: 15,
        operation: "+"
      };
      expect(validateAnswerFlexible(question, "15")).toBe(true);
      expect(validateAnswerFlexible(question, "15.0")).toBe(true);
      expect(validateAnswerFlexible(question, "15.00")).toBe(true);
    });

    test("should still reject incorrect values", () => {
      const question = { 
        question: "10 / 4", 
        answer: "2.50",
        numericAnswer: 2.5,
        operation: "/"
      };
      expect(validateAnswerFlexible(question, "2.5")).toBe(true);
      expect(validateAnswerFlexible(question, "2.50")).toBe(true);
      expect(validateAnswerFlexible(question, "2.49")).toBe(false);
      expect(validateAnswerFlexible(question, "2.51")).toBe(false);
    });
  });

  describe("validateAnswerWithFeedback", () => {
    test("should provide detailed feedback for correct answers", () => {
      const question = { 
        question: "10 + 5", 
        answer: "15",
        numericAnswer: 15,
        operation: "+"
      };
      const result = validateAnswerWithFeedback(question, "15");
      expect(result.isValid).toBe(true);
      expect(result.reason).toBe("Correct");
      expect(result.userInput).toBe("15");
      expect(result.expected).toBe("15");
    });

    test("should provide detailed feedback for incorrect answers", () => {
      const question = { 
        question: "10 + 5", 
        answer: "15",
        numericAnswer: 15,
        operation: "+"
      };
      const result = validateAnswerWithFeedback(question, "16");
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Incorrect value");
      expect(result.userInput).toBe("16");
      expect(result.expected).toBe("15");
    });

    test("should provide feedback for malformed input", () => {
      const question = { question: "10 + 5", answer: "15" };
      const result = validateAnswerWithFeedback(question, "abc");
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Invalid numeric format");
      expect(result.userInput).toBe("abc");
    });
  });

  describe("validateAnswers (batch validation)", () => {
    test("should validate multiple question-answer pairs", () => {
      const pairs = [
        { question: { question: "5 + 5", answer: "10" }, answer: "10" },
        { question: { question: "10 - 3", answer: "7" }, answer: "7" },
        { question: { question: "2 * 4", answer: "8" }, answer: "9" }
      ];
      const results = validateAnswers(pairs);
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });

  describe("checkIfSolvedCorrectly (alias)", () => {
    test("should work as alias for validateAnswer", () => {
      const question = { question: "10 + 5", answer: "15" };
      expect(checkIfSolvedCorrectly(question, "15")).toBe(true);
      expect(checkIfSolvedCorrectly(question, "16")).toBe(false);
    });
  });
});

describe("Utility Functions", () => {
  
  describe("getQuestionStats", () => {
    test("should return comprehensive question statistics", () => {
      const question = {
        question: "25 * 4",
        answer: "100",
        numericAnswer: 100,
        operation: "*",
        operands: [25, 4]
      };
      const stats = getQuestionStats(question);
      expect(stats).toHaveProperty("operands");
      expect(stats).toHaveProperty("result");
      expect(stats).toHaveProperty("operation");
      expect(stats).toHaveProperty("difficulty");
      expect(stats).toHaveProperty("hasDecimals");
      expect(stats.operands).toEqual({ num1: 25, num2: 4 });
      expect(stats.result).toBe(100);
      expect(stats.operation).toBe("*");
      expect(stats.difficulty).toBeGreaterThan(0);
      expect(stats.difficulty).toBeLessThanOrEqual(10);
    });

    test("should identify decimal results", () => {
      const divisionQuestion = {
        question: "10 / 3",
        answer: "3.33",
        numericAnswer: 3.33,
        operation: "/",
        operands: [10, 3]
      };
      const stats = getQuestionStats(divisionQuestion);
      expect(stats.hasDecimals).toBe(true);
    });

    test("should calculate appropriate difficulty scores", () => {
      const easyQuestion = {
        question: "2 + 3",
        answer: "5",
        numericAnswer: 5,
        operation: "+",
        operands: [2, 3]
      };
      const hardQuestion = {
        question: "87 / 13",
        answer: "6.69",
        numericAnswer: 6.69,
        operation: "/",
        operands: [87, 13]
      };
      const easyStats = getQuestionStats(easyQuestion);
      const hardStats = getQuestionStats(hardQuestion);
      expect(hardStats.difficulty).toBeGreaterThan(easyStats.difficulty);
    });
  });

  describe("normalizeNumericString", () => {
    test("should remove trailing zeros", () => {
      expect(normalizeNumericString("5.00")).toBe("5");
      expect(normalizeNumericString("3.40")).toBe("3.4");
      expect(normalizeNumericString("10.123000")).toBe("10.123");
    });

    test("should handle integers", () => {
      expect(normalizeNumericString("42")).toBe("42");
      expect(normalizeNumericString("0")).toBe("0");
    });
  });

  describe("Configuration", () => {
    test("setConfig should update configuration", () => {
      const originalConfig = getConfig();
      setConfig({ DIVISION_PRECISION: 4 });
      expect(getConfig().DIVISION_PRECISION).toBe(4);
      // Restore original config
      setConfig(originalConfig);
    });

    test("getConfig should return current configuration", () => {
      const config = getConfig();
      expect(config).toHaveProperty("DIVISION_PRECISION");
      expect(config).toHaveProperty("NUMBER_RANGE");
      expect(config).toHaveProperty("OPERATIONS");
      expect(config).toHaveProperty("AVOID_NEGATIVE_RESULTS");
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  
  test("should handle very large numbers", () => {
    const question = { question: "1000000 + 1000000", answer: "2000000" };
    expect(validateAnswer(question, "2000000")).toBe(true);
  });

  test("should handle scientific notation in validation", () => {
    const question = { question: "1e3 + 1e3", answer: "2000" };
    expect(validateAnswer(question, "2000")).toBe(true);
  });

  test("should handle empty and whitespace inputs", () => {
    const question = { question: "5 + 5", answer: "10" };
    expect(validateAnswer(question, "")).toBe(false);
    expect(validateAnswer(question, "   ")).toBe(false);
    expect(validateAnswer(question, "\t")).toBe(false);
  });

  test("should handle floating point precision issues", () => {
    const question = { 
      question: "0.1 + 0.2", 
      answer: "0.30",
      numericAnswer: 0.3,
      operation: "+"
    };
    expect(validateAnswerFlexible(question, "0.3")).toBe(true);
    expect(validateAnswerFlexible(question, "0.30")).toBe(true);
  });

  test("should handle boundary values", () => {
    setConfig({ NUMBER_RANGE: { min: 1, max: 100 } });
    const question = generateRandomMathQuestion();
    expect(question.operands[0]).toBeGreaterThanOrEqual(1);
    expect(question.operands[0]).toBeLessThanOrEqual(100);
    expect(question.operands[1]).toBeGreaterThanOrEqual(1);
    expect(question.operands[1]).toBeLessThanOrEqual(100);
  });
});

describe("Performance and Consistency", () => {
  
  test("should generate consistent results", () => {
    for (let i = 0; i < 100; i++) {
      const question = generateRandomMathQuestion();
      expect(validateAnswer(question, question.answer)).toBe(true);
      
      // Test with numeric answer too
      if (question.operation !== '/') {
        expect(validateAnswer(question, question.numericAnswer)).toBe(true);
      }
    }
  });

  test("should handle rapid generation without errors", () => {
    const questions = [];
    for (let i = 0; i < 1000; i++) {
      questions.push(generateRandomMathQuestion());
    }
    expect(questions).toHaveLength(1000);
    questions.forEach(q => {
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("answer");
    });
  });

  test("should maintain configuration isolation", () => {
    const originalConfig = getConfig();
    
    // Modify config
    setConfig({ DIVISION_PRECISION: 5 });
    const modifiedConfig = getConfig();
    expect(modifiedConfig.DIVISION_PRECISION).toBe(5);
    
    // Restore and verify
    setConfig(originalConfig);
    const restoredConfig = getConfig();
    expect(restoredConfig.DIVISION_PRECISION).toBe(originalConfig.DIVISION_PRECISION);
  });
});