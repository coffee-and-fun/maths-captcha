# 🧮 @coffeeandfun/maths-captcha

A small Node.js library that generates simple maths questions and checks the answers. Use it as a friendly alternative to image based CAPTCHAs. ✨

Examples of what it can ask:

- `7 + 3`
- `25% of 80`
- `√64`
- `2x + 3 = 11`
- `2, 4, 6, 8, ?`

It runs in plain JavaScript. There are no servers to call, no images to load, and no fonts to download.

---

## 📦 Install

```bash
npm install @coffeeandfun/maths-captcha
```

Requires Node.js 16 or newer.

---

## 🚀 Quick start

```js
import {
  generateRandomMathQuestion,
  validateAnswer,
} from '@coffeeandfun/maths-captcha';

const question = generateRandomMathQuestion();
console.log(question.question);
// "7 + 3"

const isCorrect = validateAnswer(question, '10');
console.log(isCorrect);
// true
```

That's the whole loop: generate a question, show it to the user, then check what they typed.

---

## 📝 What you get back

Every question is a plain object with the same shape:

```js
{
  question: '7 + 3',     // The text to show the user
  answer: '10',          // The correct answer as a string
  numericAnswer: 10,     // The correct answer as a number
  operation: '+',        // The operator or category
  operands: [7, 3],      // The numbers used to build the question
  type: 'arithmetic',    // Which question type produced it
}
```

Some types add a `style` field (for example, `square`, `cube`, `geometric`).

---

## 🎲 Question types

By default the library only asks basic arithmetic. You can switch on more types when you want harder or more varied questions.

| Type         | Example          | Notes                                |
| ------------ | ---------------- | ------------------------------------ |
| `arithmetic` | `7 + 3`          | `+` `-` `*` `/` and `%` (modulo)     |
| `power`      | `5^2`, `√64`     | Squares, cubes, perfect square roots |
| `percentage` | `25% of 80`      | Always whole-number answers          |
| `pemdas`     | `(2 + 3) * 4`    | Order of operations                  |
| `solve-x`    | `2x + 3 = 11`    | Solve for `x`                        |
| `sequence`   | `2, 4, 6, 8, ?`  | Arithmetic and geometric patterns    |

Turn on extra types with `setConfig`:

```js
import {
  setConfig,
  generateRandomMathQuestion,
} from '@coffeeandfun/maths-captcha';

setConfig({
  QUESTION_TYPES: ['arithmetic', 'power', 'percentage', 'solve-x'],
});

const question = generateRandomMathQuestion();
// e.g. { question: '√64', answer: '8', type: 'power', style: 'sqrt', ... }
```

---

## ✅ Checking answers

There are three ways to check an answer. Pick the one that fits how strict you want to be.

### `validateAnswer(question, userAnswer)`

Strict. Whole numbers must be typed as whole numbers.

```js
validateAnswer({ answer: '15' }, '15');    // ✅ true
validateAnswer({ answer: '15' }, '15.0');  // ❌ false
validateAnswer({ answer: '15' }, '16');    // ❌ false
```

### `validateAnswerFlexible(question, userAnswer)`

Friendly. Accepts the same number written different ways.

```js
const q = { answer: '4.00', numericAnswer: 4, operation: '/' };

validateAnswerFlexible(q, '4');     // ✅ true
validateAnswerFlexible(q, '4.0');   // ✅ true
validateAnswerFlexible(q, '4.00');  // ✅ true
validateAnswerFlexible(q, '3.99');  // ❌ false
```

### `validateAnswerWithFeedback(question, userAnswer)`

Returns an object that explains the result. Useful when you want to show the user why their answer was wrong.

```js
validateAnswerWithFeedback(question, 'abc');
// {
//   isValid: false,
//   reason: 'Invalid numeric format',
//   userInput: 'abc',
//   expected: '10'
// }
```

### Batch checks

If you have many answers to check at once:

```js
validateAnswers([
  { question: q1, answer: '10' },
  { question: q2, answer: '7' },
]);
// [
//   { question: '5 + 5', isValid: true, expectedAnswer: '10' },
//   { question: '14 - 7', isValid: true, expectedAnswer: '7' },
// ]
```

---

## ⚙️ Configuration

```js
import {
  setConfig,
  getConfig,
  resetConfig,
} from '@coffeeandfun/maths-captcha';

setConfig({
  DIVISION_PRECISION: 3,
  NUMBER_RANGE: { min: 1, max: 50 },
  OPERATIONS: ['+', '-', '*'],
  QUESTION_TYPES: ['arithmetic', 'power'],
  AVOID_NEGATIVE_RESULTS: true,
  AVOID_DIVISION_BY_ZERO: true,
});

getConfig();   // Read the current settings
resetConfig(); // Restore the defaults
```

### Default settings

| Option                   | Default                |
| ------------------------ | ---------------------- |
| `DIVISION_PRECISION`     | `2`                    |
| `NUMBER_RANGE`           | `{ min: 1, max: 100 }` |
| `OPERATIONS`             | `['+', '-', '*', '/']` |
| `QUESTION_TYPES`         | `['arithmetic']`       |
| `AVOID_NEGATIVE_RESULTS` | `true`                 |
| `AVOID_DIVISION_BY_ZERO` | `true`                 |
| `MAX_ATTEMPTS`           | `10`                   |
| `TOLERANCE`              | `1e-10`                |

### Difficulty examples

Easy mode for kids:

```js
setConfig({
  QUESTION_TYPES: ['arithmetic'],
  OPERATIONS: ['+'],
  NUMBER_RANGE: { min: 1, max: 10 },
});
```

Harder mode for adults:

```js
setConfig({
  QUESTION_TYPES: ['arithmetic', 'pemdas', 'solve-x', 'sequence'],
  NUMBER_RANGE: { min: 1, max: 50 },
});
```

---

## 📚 Generating in bulk

```js
import { generateMultipleQuestions } from '@coffeeandfun/maths-captcha';

const ten = generateMultipleQuestions(10);
```

## 🎯 Generating with limits

If you need a question that fits specific bounds:

```js
import { generateQuestionWithConstraints } from '@coffeeandfun/maths-captcha';

const easy = generateQuestionWithConstraints({
  operations: ['+'],
  numberRange: { min: 1, max: 10 },
  maxResult: 20,
});
```

If the library cannot produce a question that fits, it throws. Wrap the call in a `try` block if you want to handle that.

---

## 🔌 Adding your own question type

You can plug in your own generator. It just needs to return a question object in the standard shape.

```js
import {
  registerQuestionType,
  setConfig,
  generateRandomMathQuestion,
} from '@coffeeandfun/maths-captcha';

registerQuestionType('double', () => {
  const n = Math.floor(Math.random() * 20) + 1;
  return {
    question: `Double ${n}`,
    answer: String(n * 2),
    numericAnswer: n * 2,
    operation: 'custom',
    operands: [n],
    type: 'double',
  };
});

setConfig({ QUESTION_TYPES: ['double'] });

generateRandomMathQuestion();
// { question: 'Double 7', answer: '14', ... }
```

To remove it later:

```js
import { unregisterQuestionType } from '@coffeeandfun/maths-captcha';
unregisterQuestionType('double');
```

To see every type that is currently available:

```js
import { listQuestionTypes } from '@coffeeandfun/maths-captcha';
listQuestionTypes();
// ['arithmetic', 'power', 'percentage', 'pemdas', 'solve-x', 'sequence', 'double']
```

---

## 🌐 Using it with Express

Generate the question on the server and store it in the session. Validate the answer on the server too. Never trust the client to check itself.

```js
import express from 'express';
import session from 'express-session';
import {
  generateRandomMathQuestion,
  validateAnswer,
} from '@coffeeandfun/maths-captcha';

const app = express();
app.use(express.json());
app.use(session({
  secret: 'change-me',
  resave: false,
  saveUninitialized: true,
}));

app.get('/captcha', (req, res) => {
  const question = generateRandomMathQuestion();
  req.session.captcha = question;
  res.json({ question: question.question });
});

app.post('/verify', (req, res) => {
  const correct = validateAnswer(req.session.captcha, req.body.answer);
  res.json({ correct });
});
```

---

## 📖 API reference

### Generators

| Function                                              | What it does                                      |
| ----------------------------------------------------- | ------------------------------------------------- |
| `generateRandomMathQuestion(precisionOrConfig?)`      | Returns one question.                             |
| `generateMultipleQuestions(count, precisionOrConfig?)`| Returns an array of questions.                    |
| `generateQuestionWithConstraints(constraints)`        | Returns a question that fits the given limits.    |
| `registerQuestionType(name, generator)`               | Adds your own question type.                      |
| `unregisterQuestionType(name)`                        | Removes a custom question type.                   |
| `listQuestionTypes()`                                 | Lists every available type.                       |

### Validators

| Function                                  | What it does                                     |
| ----------------------------------------- | ------------------------------------------------ |
| `validateAnswer(question, answer)`        | Strict check. Returns `true` or `false`.         |
| `validateAnswerStrict(question, answer)`  | The same as `validateAnswer`. Kept for clarity.  |
| `validateAnswerFlexible(question, answer)`| Accepts equivalent decimal forms.                |
| `validateAnswerWithFeedback(question, a)` | Returns an object explaining the result.         |
| `validateAnswers(pairs)`                  | Checks many `{ question, answer }` pairs at once.|
| `checkIfSolvedCorrectly(question, answer)`| Alias for `validateAnswer`.                      |

### Configuration

| Function          | What it does                                |
| ----------------- | ------------------------------------------- |
| `getConfig()`     | Returns a copy of the current settings.     |
| `setConfig(obj)`  | Merges `obj` into the active settings.      |
| `resetConfig()`   | Restores the default settings.              |

### Helpers

| Function                          | What it does                                                           |
| --------------------------------- | ---------------------------------------------------------------------- |
| `getQuestionStats(question)`      | Returns `{ operands, result, operation, difficulty, hasDecimals }`.    |
| `calculateDifficulty(question)`   | Returns a difficulty score from 1 to 10.                               |
| `normalizeNumericString(value)`   | Trims trailing zeros from a numeric string. For example, `5.00` → `5`. |

---

## 🧪 Testing

```bash
npm test       # Run every test
npm run v1     # Run only the version 1 tests
npm run v2     # Run only the version 2 tests
npm run v3     # Run only the version 3 tests
```

The library ships with 87 tests covering question generation, every validator, edge cases, and the new question types.

---

## ⬆️ Upgrading from version 2

Version 3 is a clean rewrite split into small modules. The public API is the same, so existing code keeps working without changes. The new features (extra question types, custom generators, `resetConfig`) are opt in.

If you only ever called `generateRandomMathQuestion` and `validateAnswer`, you do not need to change anything.

---

## 📄 License

MIT. See [LICENSE](LICENSE). 🧡
