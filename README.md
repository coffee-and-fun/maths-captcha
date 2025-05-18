# Maths-Captcha

**Maths-Captcha** is a simple Node.js module that generates random math questions and verifies user answers. It's a lightweight, fun CAPTCHA alternative that helps verify human interaction by presenting basic math problems like addition, subtraction, multiplication, and division.

## Version

### 1.2.0 (2025-05-17)
- **Enhanced answer validation**:
  - Strict integer checking to reject decimal inputs when an integer is expected (e.g., "5.0" is now invalid for an expected answer of "5").
  - Manual half-up rounding for decimal answers to avoid JavaScript floating-point quirks.
  - Rejection of malformed numeric strings (e.g., "1.2.3", "4,56").
  - Negative decimals (e.g., "-2.50") are explicitly rejected, while negative zero ("-0") normalizes correctly to match "0.00".

- **New edge-case safeguards**:
  - Handles very large numbers without rounding glitches.
  - Prevents off-by-one rounding passes.

- **Test suite updates**:
  - Added comprehensive tests for strict integer equality, half-up rounding boundaries, negative zero, malformed inputs, and random question generator sanity checks.

## Features

- Generates random math problems (addition, subtraction, multiplication, division)
- Validates user answers and returns `true` or `false`
- Easy to integrate into forms or web applications as a CAPTCHA alternative

## Installation

You can install this module via npm:

```bash
npm install maths-captcha
```

## Usage

Here’s how you can use maths-captcha in your Node.js project:

```js
const { generateRandomMathQuestion, validateAnswer } = require('maths-captcha');

// Generate a random math question
const question = generateRandomMathQuestion();
console.log(`Question: ${question.question}`);

// User's answer (you'd typically get this from user input)
const userAnswer = 42;

// Validate the user's answer
const isCorrect = validateAnswer(question, userAnswer);
console.log(`Is the answer correct? ${isCorrect}`);
```

### Example Output

```bash
Question: 10 + 5
Is the answer correct? true
```

## API

### `generateRandomMathQuestion()`

Generates a random math question.

- **Returns**: An object with:
  - `question`: The math question as a string (e.g., "10 + 5")
  - `answer`: The correct answer as a string (`toFixed` for divisions)

### `validateAnswer(question, userAnswer)`

Validates the user’s answer for the provided question.

- **Parameters**:
  - `question`: The question object returned by `generateRandomMathQuestion()`
  - `userAnswer`: The user's answer as a string or number
- **Returns**: `true` if the answer is correct, `false` otherwise

### `checkIfSolvedCorrectly(question, userAnswer)`

Alias for `validateAnswer`. Identical behavior.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests if you’d like to contribute or improve this module.