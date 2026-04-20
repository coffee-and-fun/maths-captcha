# 🧮 maths-captcha v3.0.0

A cleaner, more powerful version of the library, with no breaking changes.

If you are already using version 2, your code keeps working as it is. Everything new is opt in.

---

## ✨ What's new

### 🎲 More question types

Version 3 adds five new types of maths questions. You pick which ones you want:

| Type         | Example          |
| ------------ | ---------------- |
| `power`      | `5^2`, `√64`     |
| `percentage` | `25% of 80`      |
| `pemdas`     | `(2 + 3) * 4`    |
| `solve-x`    | `2x + 3 = 11`    |
| `sequence`   | `2, 4, 6, 8, ?`  |

Turn them on like this:

```js
import { setConfig, generateRandomMathQuestion } from '@coffeeandfun/maths-captcha';

setConfig({
  QUESTION_TYPES: ['arithmetic', 'power', 'percentage', 'solve-x'],
});

const question = generateRandomMathQuestion();
```

### 🔌 Plug in your own question types

If the built-in types are not enough, you can register your own generator.

```js
import { registerQuestionType, setConfig } from '@coffeeandfun/maths-captcha';

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
```

### ➕ Modulo support

The modulo operator (`%`) is now supported inside arithmetic questions.

```js
setConfig({ OPERATIONS: ['+', '-', '*', '/', '%'] });
```

### 🧾 TypeScript support

The library now ships with full TypeScript types. You get autocomplete and type checking in VS Code and any TypeScript project with zero setup.

### 📄 Cleaner package

- Smaller install (only the code that runs in production is published)
- `engines` field declares Node 16 as the minimum version
- A proper `CHANGELOG.md` file
- A fully rewritten README in plain English with examples for every feature

---

## 🧹 Under the hood

Version 3 is a clean rewrite of the codebase. The single 500-line file is now split into small focused modules under `src/`. Nothing about the public API changed, but the code is much easier to read, test, and contribute to.

```
index.js                 Public API (re-exports)
src/config.js            Settings
src/random.js            Random helpers
src/formatter.js         Number formatting
src/validator.js         Answer checking
src/stats.js             Difficulty scoring
src/generator.js         Question dispatching
src/question-types/*.js  One file per question type
```

---

## 🐛 Bug fixes

- **Concurrency bug.** `generateQuestionWithConstraints` used to modify the global config during a call. It now works on a local copy and is safe to call from multiple places at once.
- **Crash on missing input.** `validateAnswerWithFeedback` used to crash if you passed `null` or `undefined`. It now returns a clear error object.
- **Flaky generation.** When constraints rejected most candidates, generation would sometimes give up too early. The limit is now high enough to handle tight ranges reliably.
- **Broken test script.** The `npm run v2` command was running the wrong test file. Fixed, and a `v3` script has been added.
- **Publish workflow.** Tests now run before publishing so a broken build cannot reach npm.

---

## ⬆️ Upgrading from v2

Install the new version:

```bash
npm install @coffeeandfun/maths-captcha@3
```

That is it. If you only use `generateRandomMathQuestion` and `validateAnswer`, no code changes are needed. If you want to try the new features, see the [README](README.md).

---

## 🙏 Thank you

Thanks to everyone using this library in their projects. If you hit a bug or have an idea for a new question type, please open an issue on GitHub.

Enjoy! 🧡
