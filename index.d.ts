// Type definitions for @coffeeandfun/maths-captcha

export interface NumberRange {
  min: number;
  max: number;
}

export interface MathCaptchaConfig {
  DIVISION_PRECISION: number;
  NUMBER_RANGE: NumberRange;
  TOLERANCE: number;
  OPERATIONS: string[];
  QUESTION_TYPES: string[];
  AVOID_DIVISION_BY_ZERO: boolean;
  AVOID_NEGATIVE_RESULTS: boolean;
  MAX_ATTEMPTS: number;
}

export interface MathQuestion {
  question: string;
  answer: string;
  numericAnswer: number;
  operation: string;
  operands: number[];
  type: string;
  style?: string;
}

export interface QuestionConstraints {
  operations?: string[];
  numberRange?: NumberRange;
  maxResult?: number;
  minResult?: number;
  precision?: number;
  questionTypes?: string[];
}

export interface ValidationFeedback {
  isValid: boolean;
  reason: string;
  userInput: unknown;
  expected: string;
  userNumber?: number;
  expectedNumber?: number;
}

export interface BatchValidationResult {
  question: string;
  isValid: boolean;
  expectedAnswer: string;
}

export interface QuestionStats {
  operands: { num1: number; num2: number };
  result: number;
  operation: string;
  difficulty: number;
  hasDecimals: boolean;
}

export type QuestionGenerator = (config: MathCaptchaConfig) => MathQuestion;

// Configuration
export const DEFAULT_CONFIG: MathCaptchaConfig;
export function getConfig(): MathCaptchaConfig;
export function setConfig(updates: Partial<MathCaptchaConfig>): void;
export function resetConfig(): void;

// Generators
export function generateRandomMathQuestion(
  precisionOrConfig?: number | Partial<MathCaptchaConfig>,
): MathQuestion;

export function generateMultipleQuestions(
  count?: number,
  precisionOrConfig?: number | Partial<MathCaptchaConfig>,
): MathQuestion[];

export function generateQuestionWithConstraints(
  constraints?: QuestionConstraints,
): MathQuestion;

export function registerQuestionType(
  name: string,
  generator: QuestionGenerator,
): void;

export function unregisterQuestionType(name: string): void;
export function listQuestionTypes(): string[];

// Validators
export function validateAnswer(
  question: Pick<MathQuestion, 'answer'> & Partial<MathQuestion>,
  userAnswer: string | number | null | undefined,
): boolean;

export function validateAnswerStrict(
  question: Pick<MathQuestion, 'answer'> & Partial<MathQuestion>,
  userAnswer: string | number | null | undefined,
): boolean;

export function validateAnswerFlexible(
  question: MathQuestion,
  userAnswer: string | number | null | undefined,
): boolean;

export function validateAnswerWithFeedback(
  question: MathQuestion,
  userAnswer: string | number | null | undefined,
): ValidationFeedback;

export function validateAnswers(
  pairs: Array<{ question: MathQuestion; answer: string | number }>,
): BatchValidationResult[];

export function checkIfSolvedCorrectly(
  question: Pick<MathQuestion, 'answer'> & Partial<MathQuestion>,
  userAnswer: string | number | null | undefined,
): boolean;

// Stats
export function getQuestionStats(question: MathQuestion): QuestionStats;
export function calculateDifficulty(question: MathQuestion): number;

// Helpers
export function normalizeNumericString(value: string): string;
