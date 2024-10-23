# Maths-Captcha

**Maths-Captcha** is a simple Node.js module that generates random math questions and verifies user answers. It's a lightweight, fun CAPTCHA alternative that helps verify human interaction by presenting basic math problems like addition, subtraction, multiplication, and division.

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
  - `answer`: The correct answer as a number

### `validateAnswer(question, userAnswer)`

Validates the user’s answer for the provided question.

- **Parameters**:
  - `question`: The question object returned by `generateRandomMathQuestion()`
  - `userAnswer`: The user's answer as a number
- **Returns**: `true` if the answer is correct, `false` otherwise


## License
This project is licensed under the MIT License. See the LICENSE file for details.


## Contributing

Feel free to submit issues or pull requests if you’d like to contribute or improve this module.

