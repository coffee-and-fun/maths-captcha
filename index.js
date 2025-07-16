const OPERATIONS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

const CONFIG = {
  DIVISION_PRECISION: 2,
  NUMBER_RANGE: { min: 1, max: 100 },
  TOLERANCE: 1e-10, // For floating point comparison
  OPERATIONS: Object.keys(OPERATIONS), // Allow customizing which operations to use
  AVOID_DIVISION_BY_ZERO: true,
  AVOID_NEGATIVE_RESULTS: true,
  MAX_ATTEMPTS: 10, // Prevent infinite loops in generation
};

/**
 * Returns a random integer between min and max, inclusive.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from the given array.
 */
function getRandomElement(arr) {
  return arr[getRandomInt(0, arr.length - 1)];
}

/**
 * Generates a math question with smart constraints to avoid problematic cases.
 */
function generateRandomMathQuestion(precision = CONFIG.DIVISION_PRECISION) {
  let attempts = 0;
  
  while (attempts < CONFIG.MAX_ATTEMPTS) {
    let num1 = getRandomInt(CONFIG.NUMBER_RANGE.min, CONFIG.NUMBER_RANGE.max);
    let num2 = getRandomInt(CONFIG.NUMBER_RANGE.min, CONFIG.NUMBER_RANGE.max);
    const operation = getRandomElement(CONFIG.OPERATIONS);
    
    // Smart constraints based on operation
    if (operation === "-" && CONFIG.AVOID_NEGATIVE_RESULTS && num1 < num2) {
      [num1, num2] = [num2, num1]; // Swap to ensure positive result
    }
    
    if (operation === "/" && CONFIG.AVOID_DIVISION_BY_ZERO && num2 === 0) {
      attempts++;
      continue; // Retry with different numbers
    }
    
    const question = `${num1} ${operation} ${num2}`;
    const result = OPERATIONS[operation](num1, num2);
    
    // Store both the raw numeric result and formatted string
    const formattedAnswer = operation === "/" 
      ? result.toFixed(precision)
      : result.toString();

    return { 
      question, 
      answer: formattedAnswer,
      numericAnswer: result,
      operation,
      operands: [num1, num2]
    };
  }
  
  // Fallback to simple addition if all attempts failed
  const num1 = getRandomInt(1, 10);
  const num2 = getRandomInt(1, 10);
  const result = num1 + num2;
  
  return {
    question: `${num1} + ${num2}`,
    answer: result.toString(),
    numericAnswer: result,
    operation: "+",
    operands: [num1, num2]
  };
}

/**
 * Generates multiple questions at once.
 */
function generateMultipleQuestions(count = 1, precision = CONFIG.DIVISION_PRECISION) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateRandomMathQuestion(precision));
  }
  return questions;
}

/**
 * Generates a question with specific constraints.
 */
function generateQuestionWithConstraints(constraints = {}) {
  const {
    operations = CONFIG.OPERATIONS,
    numberRange = CONFIG.NUMBER_RANGE,
    maxResult = Infinity,
    minResult = -Infinity,
    precision = CONFIG.DIVISION_PRECISION
  } = constraints;
  
  const tempConfig = { ...CONFIG };
  CONFIG.OPERATIONS = operations;
  CONFIG.NUMBER_RANGE = numberRange;
  
  let attempts = 0;
  while (attempts < CONFIG.MAX_ATTEMPTS) {
    const question = generateRandomMathQuestion(precision);
    const result = question.numericAnswer;
    
    if (result >= minResult && result <= maxResult) {
      Object.assign(CONFIG, tempConfig); // Restore original config
      return question;
    }
    attempts++;
  }
  
  Object.assign(CONFIG, tempConfig); // Restore original config
  throw new Error('Could not generate question within constraints');
}

/**
 * Validates if a string represents a well-formed number.
 */
function isValidNumericString(str) {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  
  // Reject empty string
  if (trimmed === '') return false;
  
  // Reject malformed patterns like "1.2.3", "4,56", "--5"
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return false;
  
  // Additional check for valid number
  return !isNaN(Number(trimmed));
}

/**
 * Compares two numbers with tolerance for floating point precision issues.
 */
function numbersEqual(a, b, tolerance = CONFIG.TOLERANCE) {
  return Math.abs(a - b) < tolerance;
}

/**
 * Enhanced validation that supports flexible decimal input while maintaining original strict behavior.
 * For backwards compatibility with existing tests.
 */
function validateAnswer(questionObj, userAnswer) {
  // Handle null/undefined input
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }
  
  const expected = questionObj.answer.toString();
  const userStr = userAnswer.toString().trim();
  
  // Reject malformed input
  if (!isValidNumericString(userStr)) {
    return false;
  }
  
  const expectedDecimals = getDecimalPlaces(expected);
  
  // For integer answers, reject any decimal input (strict mode)
  if (expectedDecimals === 0) {
    if (userStr.includes('.')) return false;
    return userStr === expected;
  }
  
  // Reject negative decimals (original business rule)
  if (userStr.startsWith('-') && userStr.includes('.')) {
    return false;
  }
  
  // For division answers with decimals, use flexible validation
  // Allow 3.4, 3.40, 3.444 to all match expected answer of 3.40
  const userNum = parseFloat(userStr);
  const expectedNum = parseFloat(expected);
  
  // Handle special case for zero
  if (userNum === 0 && expectedNum === 0) {
    return true;
  }
  
  // Round user input to expected precision and compare
  const roundedUser = roundToDecimalPlaces(userStr, expectedDecimals);
  return roundedUser === expected;
}

/**
 * Flexible validation that accepts different decimal representations.
 * Examples: 3.4, 3.40, 3.444444 all match expected answer of 3.40
 */
function validateAnswerFlexible(questionObj, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }
  
  const userStr = userAnswer.toString().trim();
  
  // Reject malformed input
  if (!isValidNumericString(userStr)) {
    return false;
  }
  
  const userNum = parseFloat(userStr);
  const expectedNum = questionObj.numericAnswer || parseFloat(questionObj.answer);
  
  // Handle special cases
  if (!Number.isFinite(userNum) || !Number.isFinite(expectedNum)) {
    return false;
  }
  
  // For integer operations, allow flexible input but compare as numbers
  if (questionObj.operation !== '/') {
    return numbersEqual(userNum, expectedNum);
  }
  
  // For division, be more lenient with precision
  const precision = CONFIG.DIVISION_PRECISION + 2; // Allow extra precision in input
  const userRounded = Math.round(userNum * Math.pow(10, precision)) / Math.pow(10, precision);
  const expectedRounded = Math.round(expectedNum * Math.pow(10, precision)) / Math.pow(10, precision);
  
  return numbersEqual(userRounded, expectedRounded);
}

/**
 * Enhanced validation with detailed feedback for debugging.
 */
function validateAnswerWithFeedback(questionObj, userAnswer) {
  const userStr = userAnswer.toString().trim();
  
  // Check for malformed input
  if (!isValidNumericString(userStr)) {
    return { 
      isValid: false, 
      reason: 'Invalid numeric format',
      userInput: userStr,
      expected: questionObj.answer
    };
  }
  
  const userNum = parseFloat(userStr);
  const expectedNum = questionObj.numericAnswer || parseFloat(questionObj.answer);
  
  // Handle special cases
  if (!Number.isFinite(userNum)) {
    return { 
      isValid: false, 
      reason: 'User input is not a finite number',
      userInput: userStr,
      expected: questionObj.answer
    };
  }
  
  if (!Number.isFinite(expectedNum)) {
    return { 
      isValid: false, 
      reason: 'Expected answer is not a finite number',
      userInput: userStr,
      expected: questionObj.answer
    };
  }
  
  // For integer operations, allow flexible input but compare as numbers
  if (questionObj.operation !== '/') {
    const isValid = numbersEqual(userNum, expectedNum);
    return {
      isValid,
      reason: isValid ? 'Correct' : 'Incorrect value',
      userInput: userStr,
      userNumber: userNum,
      expectedNumber: expectedNum,
      expected: questionObj.answer
    };
  }
  
  // For division, be more lenient with precision
  const precision = CONFIG.DIVISION_PRECISION + 2;
  const userRounded = Math.round(userNum * Math.pow(10, precision)) / Math.pow(10, precision);
  const expectedRounded = Math.round(expectedNum * Math.pow(10, precision)) / Math.pow(10, precision);
  
  const isValid = numbersEqual(userRounded, expectedRounded);
  return {
    isValid,
    reason: isValid ? 'Correct' : 'Incorrect value',
    userInput: userStr,
    userNumber: userNum,
    expectedNumber: expectedNum,
    expected: questionObj.answer
  };
}

/**
 * Batch validation for multiple answers.
 */
function validateAnswers(questionAnswerPairs) {
  return questionAnswerPairs.map(({ question, answer }) => ({
    question: question.question,
    isValid: validateAnswer(question, answer),
    expectedAnswer: question.answer
  }));
}

/**
 * Determines the number of decimal places in a numeric string.
 */
function getDecimalPlaces(numStr) {
  const parts = numStr.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Performs half-up rounding on a numeric string to specified decimal places.
 */
function roundToDecimalPlaces(numStr, decimals) {
  const isNegative = numStr.startsWith('-');
  const absStr = isNegative ? numStr.slice(1) : numStr;
  
  let [intPart, decPart = ''] = absStr.split('.');
  
  // Pad with zeros to ensure we have enough digits for rounding
  decPart = decPart.padEnd(decimals + 1, '0');
  
  const roundingDigit = parseInt(decPart[decimals] || '0');
  let keptDecimals = decPart.slice(0, decimals);
  
  // Apply half-up rounding (5 and above rounds up)
  if (roundingDigit >= 5) {
    const rounded = addOneToDecimalString(keptDecimals);
    
    if (rounded.overflow) {
      // Carry over to integer part
      intPart = (BigInt(intPart) + 1n).toString();
      keptDecimals = '0'.repeat(decimals);
    } else {
      keptDecimals = rounded.result;
    }
  }
  
  // Construct final result
  const finalDecimals = keptDecimals.padEnd(decimals, '0');
  let result = decimals > 0 ? `${intPart}.${finalDecimals}` : intPart;
  
  // Apply negative sign if needed (but normalize -0 to 0)
  if (isNegative && !isEffectivelyZero(result)) {
    result = `-${result}`;
  }
  
  return result;
}

/**
 * Adds 1 to a decimal string, handling carry-over.
 */
function addOneToDecimalString(decStr) {
  if (!decStr) return { result: '1', overflow: true };
  
  const digits = decStr.split('').reverse();
  let carry = 1;
  
  for (let i = 0; i < digits.length && carry; i++) {
    const sum = parseInt(digits[i]) + carry;
    digits[i] = (sum % 10).toString();
    carry = Math.floor(sum / 10);
  }
  
  return {
    result: digits.reverse().join(''),
    overflow: carry > 0
  };
}

/**
 * Checks if a numeric string represents zero (including "0.00", etc.).
 */
function isEffectivelyZero(numStr) {
  return /^0*\.?0*$/.test(numStr.replace('-', ''));
}

/**
 * Strict validation mode - matches original behavior exactly.
 * Use this if you need the old strict decimal place matching.
 */
function validateAnswerStrict(questionObj, userAnswer) {
  const expected = questionObj.answer.toString();
  const userStr = userAnswer.toString().trim();
  
  // Reject malformed input
  if (!isValidNumericString(userStr)) {
    return false;
  }
  
  const expectedDecimals = getDecimalPlaces(expected);
  
  // For integer answers, reject any decimal input
  if (expectedDecimals === 0) {
    return userStr.includes('.') ? false : userStr === expected;
  }
  
  // Reject negative decimals (original business rule)
  if (userStr.startsWith('-') && userStr.includes('.')) {
    return false;
  }
  
  // Round user input to expected precision and compare
  const roundedUser = roundToDecimalPlaces(userStr, expectedDecimals);
  return roundedUser === expected;
}

/**
 * Get statistics about question difficulty.
 */
function getQuestionStats(question) {
  const [num1, num2] = question.operands;
  const result = question.numericAnswer;
  
  return {
    operands: { num1, num2 },
    result,
    operation: question.operation,
    difficulty: calculateDifficulty(question),
    hasDecimals: question.operation === '/' || !Number.isInteger(result)
  };
}

/**
 * Calculate a simple difficulty score (1-10).
 */
function calculateDifficulty(question) {
  const [num1, num2] = question.operands;
  const { operation } = question;
  
  let score = 1;
  
  // Operation difficulty
  const opDifficulty = { '+': 1, '-': 2, '*': 3, '/': 4 };
  score += opDifficulty[operation] || 1;
  
  // Number size difficulty
  const maxOperand = Math.max(num1, num2);
  if (maxOperand > 50) score += 2;
  else if (maxOperand > 20) score += 1;
  
  // Result complexity
  if (operation === '/' && question.answer.includes('.')) score += 2;
  if (question.numericAnswer > 100) score += 1;
  
  return Math.min(score, 10);
}

/**
 * Normalizes a numeric string by removing trailing zeros and unnecessary decimal points.
 */
function normalizeNumericString(str) {
  const num = parseFloat(str);
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toString().replace(/\.?0+$/, '');
}

/**
 * Alias for validateAnswer for backward compatibility.
 */
function checkIfSolvedCorrectly(questionObj, userAnswer) {
  return validateAnswer(questionObj, userAnswer);
}

/**
 * Configuration helper to adjust settings.
 */
function setConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
}

/**
 * Get current configuration.
 */
function getConfig() {
  return { ...CONFIG };
}

export { 
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
};