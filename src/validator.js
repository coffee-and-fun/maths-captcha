import { getConfig } from './config.js';
import {
  isValidNumericString,
  getDecimalPlaces,
  roundToDecimalPlaces,
  numbersEqual,
} from './formatter.js';

export function validateAnswer(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) return false;

  const expected = question.answer.toString();
  const userInput = userAnswer.toString().trim();

  if (!isValidNumericString(userInput)) return false;

  const expectedDecimals = getDecimalPlaces(expected);

  if (expectedDecimals === 0) {
    if (userInput.includes('.')) return false;
    return userInput === expected;
  }

  if (userInput.startsWith('-') && userInput.includes('.')) return false;

  const userNumber = parseFloat(userInput);
  const expectedNumber = parseFloat(expected);
  if (userNumber === 0 && expectedNumber === 0) return true;

  return roundToDecimalPlaces(userInput, expectedDecimals) === expected;
}

export function validateAnswerStrict(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) return false;

  const expected = question.answer.toString();
  const userInput = userAnswer.toString().trim();

  if (!isValidNumericString(userInput)) return false;

  const expectedDecimals = getDecimalPlaces(expected);

  if (expectedDecimals === 0) {
    return userInput.includes('.') ? false : userInput === expected;
  }

  if (userInput.startsWith('-') && userInput.includes('.')) return false;

  return roundToDecimalPlaces(userInput, expectedDecimals) === expected;
}

export function validateAnswerFlexible(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) return false;

  const userInput = userAnswer.toString().trim();
  if (!isValidNumericString(userInput)) return false;

  const userNumber = parseFloat(userInput);
  const expectedNumber =
    question.numericAnswer ?? parseFloat(question.answer);

  if (!Number.isFinite(userNumber) || !Number.isFinite(expectedNumber)) {
    return false;
  }

  if (question.operation !== '/') {
    return numbersEqual(userNumber, expectedNumber, getConfig().TOLERANCE);
  }

  const precision = getConfig().DIVISION_PRECISION + 2;
  const factor = Math.pow(10, precision);
  return numbersEqual(
    Math.round(userNumber * factor) / factor,
    Math.round(expectedNumber * factor) / factor,
    getConfig().TOLERANCE,
  );
}

export function validateAnswerWithFeedback(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) {
    return {
      isValid: false,
      reason: 'No answer provided',
      userInput: userAnswer,
      expected: question.answer,
    };
  }

  const userInput = userAnswer.toString().trim();

  if (!isValidNumericString(userInput)) {
    return {
      isValid: false,
      reason: 'Invalid numeric format',
      userInput,
      expected: question.answer,
    };
  }

  const userNumber = parseFloat(userInput);
  const expectedNumber =
    question.numericAnswer ?? parseFloat(question.answer);

  if (!Number.isFinite(userNumber)) {
    return {
      isValid: false,
      reason: 'User input is not a finite number',
      userInput,
      expected: question.answer,
    };
  }

  if (!Number.isFinite(expectedNumber)) {
    return {
      isValid: false,
      reason: 'Expected answer is not a finite number',
      userInput,
      expected: question.answer,
    };
  }

  const tolerance = getConfig().TOLERANCE;

  if (question.operation !== '/') {
    const isValid = numbersEqual(userNumber, expectedNumber, tolerance);
    return {
      isValid,
      reason: isValid ? 'Correct' : 'Incorrect value',
      userInput,
      userNumber,
      expectedNumber,
      expected: question.answer,
    };
  }

  const precision = getConfig().DIVISION_PRECISION + 2;
  const factor = Math.pow(10, precision);
  const isValid = numbersEqual(
    Math.round(userNumber * factor) / factor,
    Math.round(expectedNumber * factor) / factor,
    tolerance,
  );

  return {
    isValid,
    reason: isValid ? 'Correct' : 'Incorrect value',
    userInput,
    userNumber,
    expectedNumber,
    expected: question.answer,
  };
}

export function validateAnswers(pairs) {
  return pairs.map(({ question, answer }) => ({
    question: question.question,
    isValid: validateAnswer(question, answer),
    expectedAnswer: question.answer,
  }));
}

export function checkIfSolvedCorrectly(question, userAnswer) {
  return validateAnswer(question, userAnswer);
}
