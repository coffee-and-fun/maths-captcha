const OPERATIONS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

/**
 * Returns a random integer between min and max, inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from the given array.
 * @param {Array} arr
 * @returns {*}
 */
function pick(arr) {
  const idx = getRandomInt(0, arr.length - 1);
  return arr[idx];
}

/**
 * Generates a math question and a string-formatted answer at given precision.
 * @param {number} precision number of decimal places for division answers
 * @returns {{question: string, answer: string}}
 */
function generateRandomMathQuestion(precision = 2) {
  const num1 = getRandomInt(1, 100);
  const num2 = getRandomInt(1, 100);
  const operation = pick(Object.keys(OPERATIONS));

  // human-readable question string and numeric result
  const questionStr = `${num1} ${operation} ${num2}`;
  const rawResult = OPERATIONS[operation](num1, num2);

  // format answer as string at desired precision
  const answer = operation === "/"
    ? rawResult.toFixed(precision)
    : rawResult.toString();

  return { question: questionStr, answer };
}

/**
 * Manually rounds a numeric string to the given decimal places using half-up.
 * @param {string} str Numeric string matching /^-?\d+(\.\d+)?$/
 * @param {number} decimals Number of decimal places
 * @returns {string} Rounded string
 */
function manualRound(str, decimals) {
  const isNegative = str.trim().startsWith('-');
  // Work with absolute part
  const absStr = isNegative ? str.trim().slice(1) : str.trim();
  let [intPart, decPart = ''] = absStr.split('.');
  // Pad decimal part to at least decimals+1 for rounding digit
  while (decPart.length <= decimals) {
    decPart += '0';
  }
  // Determine digit after rounding position
  const digitAfter = decPart.charAt(decimals);
  // Digits to keep
  let kept = decPart.slice(0, decimals);

  // Decide if we need to increment (half-up rounding)
  if (digitAfter >= '5') {
    let carry = 1;
    // Add carry to kept string
    const arr = kept.split('').reverse();
    for (let i = 0; i < arr.length; i++) {
      let digit = parseInt(arr[i], 10) + carry;
      if (digit === 10) {
        arr[i] = '0';
        carry = 1;
      } else {
        arr[i] = digit.toString();
        carry = 0;
        break;
      }
    }
    if (carry === 1) {
      // All decimals rolled over; increment integer part
      intPart = (BigInt(intPart) + BigInt(1)).toString();
    }
    kept = arr.reverse().join('');
  }

  // Construct result
  const resultDec = kept.padEnd(decimals, '0');
  const result = decimals > 0 ? `${intPart}.${resultDec}` : intPart;
  // Restore sign for non-zero values
  if (isNegative && !/^0*\.?0*$/.test(intPart + resultDec)) {
    return `-${result}`;
  }
  // For zero or positive, return without '-'
  return result;
}

/**
 * Validates userAnswer against stored answer string with fixed-precision compare.
 * @param {{answer: string|number}} qObj
 * @param {string|number} userAnswer
 * @returns {boolean}
 */
function validateAnswer(qObj, userAnswer) {
  // normalize expected answer to string
  const expected = typeof qObj.answer === 'number'
    ? qObj.answer.toString()
    : qObj.answer;

  // determine expected decimal places
  const decimals = expected.includes('.')
    ? expected.split('.')[1].length
    : 0;

  // normalize user input to string
  const userAnswerStr = typeof userAnswer === 'number'
    ? userAnswer.toString()
    : userAnswer;

  if (typeof userAnswerStr !== 'string') return false;

  const trimmed = userAnswerStr.trim();
  // reject malformed numeric strings (e.g., '1.2.3', '4,56')
  const numericPattern = /^-?\d+(\.\d+)?$/;
  if (!numericPattern.test(trimmed)) return false;

  // Strict integer comparison when no decimals expected
  if (decimals === 0) {
    if (trimmed.includes('.')) return false;
    return trimmed === expected;
  }

  // Reject negative decimal inputs with a dot (e.g. '-0.00', '-1.23')
  if (trimmed.startsWith('-') && trimmed.includes('.')) {
    return false;
  }

  // Manual rounding and compare for decimals
  const rounded = manualRound(trimmed, decimals);
  return rounded === expected;
}

/**
 * Checks if the provided answer is correct.
 * @param {{answer: string|number}} qObj
 * @param {string|number} userAnswer
 * @returns {boolean}
 */
function checkIfSolvedCorrectly(qObj, userAnswer) {
  return validateAnswer(qObj, userAnswer);
}

export { generateRandomMathQuestion, validateAnswer, checkIfSolvedCorrectly };
