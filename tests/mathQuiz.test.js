// mathQuiz.test.js
const { generateRandomMathQuestion, validateAnswer, checkIfSolvedCorrectly } = require('../index');

describe('Math Quiz Module', () => {
  
  test('should generate a valid math question', () => {
    const question = generateRandomMathQuestion();
    expect(question).toHaveProperty('question');
    expect(question).toHaveProperty('answer');
  });

  test('should validate the correct answer', () => {
    const question = { question: '10 + 5', answer: 15 };
    const result = validateAnswer(question, 15);
    expect(result).toBe(true);
  });

  test('should return "Correct!" if the user answers correctly', () => {
    const question = { question: '10 - 5', answer: 5 };
    const result = checkIfSolvedCorrectly(question, 5);
    expect(result).toBe(true);
  });

  test('should return "Wrong!" if the user answers incorrectly', () => {
    const question = { question: '10 * 5', answer: 50 };
    const result = checkIfSolvedCorrectly(question, 60);
    expect(result).toBe(false);
  });

});
