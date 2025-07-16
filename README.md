# 🧮 @coffeeandfun/maths-captcha

**A simple, fun way to verify humans with math problems!**

@coffeeandfun/maths-captcha is a lightweight Node.js module that creates random math questions and checks user answers. It's perfect for replacing traditional CAPTCHAs with something more engaging and accessible. Instead of squinting at distorted text, your users solve simple math problems like "What's 7 + 3?"

---


## 📦 Installation

Getting started is super easy! Just install via npm:

```bash
npm install @coffeeandfun/maths-captcha
```

---

## 🏃‍♂️ Quick Start

Here's how to get up and running in under 30 seconds:

```javascript
// Import the functions you need
import { generateRandomMathQuestion, validateAnswer } from '@coffeeandfun/maths-captcha';

// 1. Generate a math question
const question = generateRandomMathQuestion();
console.log(`Question: ${question.question}`);
// Output: "Question: 7 + 3"

// 2. Get the user's answer (from a form, input, etc.)
const userAnswer = "10"; // This would come from user input

// 3. Check if they got it right
const isCorrect = validateAnswer(question, userAnswer);
console.log(`Correct: ${isCorrect}`);
// Output: "Correct: true"
```

### 🌟 Real-World Example

```javascript
const express = require('express');
const { generateRandomMathQuestion, validateAnswer } = require('@coffeeandfun/maths-captcha');

const app = express();

// Generate a question for the user
app.get('/captcha', (req, res) => {
  const question = generateRandomMathQuestion();
  req.session.captcha = question; // Store in session
  res.json({ question: question.question });
});

// Verify the user's answer
app.post('/verify', (req, res) => {
  const userAnswer = req.body.answer;
  const isCorrect = validateAnswer(req.session.captcha, userAnswer);
  
  if (isCorrect) {
    res.json({ success: true, message: "Correct! You're human! 🎉" });
  } else {
    res.json({ success: false, message: "Try again! 🤔" });
  }
});
```

---

## 📚 Complete API Reference

### Core Functions

#### `generateRandomMathQuestion(precision?)`
Creates a random math question with smart defaults.

```javascript
const question = generateRandomMathQuestion();
console.log(question);
// {
//   question: "15 + 8",
//   answer: "23",
//   numericAnswer: 23,
//   operation: "+",
//   operands: [15, 8]
// }
```

**Parameters:**
- `precision` (optional): Number of decimal places for division (default: 2)

**Returns:** Question object with all the details you need

#### `validateAnswer(question, userAnswer)`
Checks if the user's answer is correct (strict mode for backward compatibility).

```javascript
const question = { question: "10 + 5", answer: "15" };

validateAnswer(question, "15");    // ✅ true
validateAnswer(question, "15.0");  // ❌ false (strict integer mode)
validateAnswer(question, "16");    // ❌ false
```

#### `validateAnswerFlexible(question, userAnswer)`
More user-friendly validation that accepts different formats.

```javascript
const question = { 
  question: "10 / 4", 
  answer: "2.50",
  numericAnswer: 2.5,
  operation: "/"
};

validateAnswerFlexible(question, "2.5");     // ✅ true
validateAnswerFlexible(question, "2.50");    // ✅ true  
validateAnswerFlexible(question, "2.500");   // ✅ true
validateAnswerFlexible(question, "2.49");    // ❌ false
```

### Advanced Features

#### `generateMultipleQuestions(count, precision?)`
Generate several questions at once.

```javascript
const questions = generateMultipleQuestions(3);
// Returns array of 3 question objects
```

#### `generateQuestionWithConstraints(options)`
Create questions with specific requirements.

```javascript
const easyQuestion = generateQuestionWithConstraints({
  operations: ['+', '-'],        // Only addition and subtraction
  numberRange: { min: 1, max: 20 }, // Small numbers only
  maxResult: 50                  // Keep results under 50
});
```

#### `validateAnswerWithFeedback(question, userAnswer)`
Get detailed information about why validation failed.

```javascript
const result = validateAnswerWithFeedback(question, "wrong");
console.log(result);
// {
//   isValid: false,
//   reason: "Invalid numeric format",
//   userInput: "wrong",
//   expected: "15"
// }
```

#### `getQuestionStats(question)`
Analyze question difficulty and properties.

```javascript
const stats = getQuestionStats(question);
console.log(stats);
// {
//   difficulty: 4,        // Scale of 1-10
//   hasDecimals: false,
//   operands: { num1: 15, num2: 8 },
//   operation: "+",
//   result: 23
// }
```

### Configuration

#### `setConfig(options)` & `getConfig()`
Customize the behavior to fit your needs.

```javascript
const { setConfig, getConfig } = require('maths-captcha');

// Customize settings
setConfig({
  DIVISION_PRECISION: 3,           // 3 decimal places for division
  NUMBER_RANGE: { min: 1, max: 50 }, // Smaller numbers
  OPERATIONS: ['+', '-', '*'],     // No division
  AVOID_NEGATIVE_RESULTS: true     // Keep results positive
});

// Check current settings
const config = getConfig();
console.log(config);
```

### Utility Functions

#### `normalizeNumericString(str)`
Clean up numeric strings by removing trailing zeros.

```javascript
normalizeNumericString("5.00");    // "5"
normalizeNumericString("3.40");    // "3.4"
```

#### `checkIfSolvedCorrectly(question, userAnswer)`
Alias for `validateAnswer()` - same functionality.

---

## 🎨 Customization Examples

### Easy Mode (Addition & Subtraction Only)
```javascript
setConfig({
  OPERATIONS: ['+', '-'],
  NUMBER_RANGE: { min: 1, max: 20 },
  AVOID_NEGATIVE_RESULTS: true
});
```

### Hard Mode (Larger Numbers & Division)
```javascript
setConfig({
  NUMBER_RANGE: { min: 10, max: 100 },
  DIVISION_PRECISION: 3,
  OPERATIONS: ['+', '-', '*', '/']
});
```

### Kid-Friendly Mode
```javascript
setConfig({
  OPERATIONS: ['+'],
  NUMBER_RANGE: { min: 1, max: 10 },
  AVOID_NEGATIVE_RESULTS: true
});
```

---

## 🔧 Framework Integration

### Express.js
```javascript
app.use(session({ secret: 'your-secret' }));

app.get('/captcha', (req, res) => {
  const question = generateRandomMathQuestion();
  req.session.captcha = question;
  res.render('form', { question: question.question });
});
```

### React/Next.js
```javascript
const [captcha, setCaptcha] = useState(null);

useEffect(() => {
  // Generate question on component mount
  const question = generateRandomMathQuestion();
  setCaptcha(question);
}, []);

const handleSubmit = (userAnswer) => {
  if (validateAnswerFlexible(captcha, userAnswer)) {
    // Success!
  }
};
```

### Vue.js
```javascript
data() {
  return {
    captcha: null,
    userAnswer: ''
  }
},
created() {
  this.captcha = generateRandomMathQuestion();
},
methods: {
  checkAnswer() {
    return validateAnswer(this.captcha, this.userAnswer);
  }
}
```

---

## 🧪 Testing

We've included comprehensive tests to ensure everything works perfectly:

```bash
npm test
```

The test suite includes:
- ✅ 100+ test cases covering all scenarios
- ✅ Edge case handling (malformed input, large numbers, etc.)
- ✅ Performance tests (1000+ rapid generations)
- ✅ Backward compatibility verification
- ✅ All validation modes tested

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **🐛 Report Issues**: Found a bug? Let us know!
2. **💡 Suggest Features**: Have ideas? We'd love to hear them!
3. **🔧 Submit PRs**: Code improvements are always welcome!
4. **📖 Improve Docs**: Help make this README even better!

### Development Setup
```bash
git clone https://github.com/coffeeandfun/maths-captcha
cd maths-captcha
npm install
npm test
```

---

## 📄 License

This project is licensed under the MIT License. Feel free to use it in your projects!

---

## 🙏 Credits

**Coffee & Fun LLC** - Making the web more accessible and enjoyable

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: Open an issue on GitHub
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/coffeeandfun/maths-captcha/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/coffeeandfun/maths-captcha/discussions)

---

## 🌟 Show Your Support

If this project helped you, consider:
- ⭐ Starring the repository
- 🐦 Sharing it with others
- 💝 Contributing to make it even better

## 🧡 License

[MIT](https://opensource.org/licenses/MIT) – because sharing is caring.

---