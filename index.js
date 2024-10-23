// mathQuiz.js

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function generateRandomMathQuestion() {
    const operations = ['+', '-', '*', '/'];
    const num1 = getRandomInt(1, 100); // random number between 1 and 100
    const num2 = getRandomInt(1, 100); // random number between 1 and 100
    const operation = operations[getRandomInt(0, operations.length - 1)];
    
    let question = `${num1} ${operation} ${num2}`;
    let answer;
  
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        answer = (num2 !== 0) ? (num1 / num2).toFixed(2) : 'undefined'; // avoid division by zero
        break;
    }
  
    return { question, answer: parseFloat(answer) };
  }
  
  function validateAnswer(question, userAnswer) {
    return question.answer === parseFloat(userAnswer);
  }
  
  function checkIfSolvedCorrectly(question, userAnswer) {
    return validateAnswer(question, userAnswer) ? true : false;
  }
  
  module.exports = { generateRandomMathQuestion, validateAnswer, checkIfSolvedCorrectly };
  