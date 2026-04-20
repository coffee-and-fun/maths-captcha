# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.4](https://github.com/coffee-and-fun/maths-captcha/compare/maths-captcha-v3.1.3...maths-captcha-v3.1.4) (2026-04-20)


### Bug Fixes

* short description of what you fixed ([15352c7](https://github.com/coffee-and-fun/maths-captcha/commit/15352c7c103f799538074955cd7b5da4e56a6a4b))
* trigger release-please ([5d4ba32](https://github.com/coffee-and-fun/maths-captcha/commit/5d4ba32d971ada6a31515a377d664e5365212bfd))

## [3.0.0] - 2026-04-19

Version 3 is a clean rewrite of the library. The public API is unchanged, so existing code keeps working without changes.

### Added

- New question types beyond basic arithmetic:
  - `power` — squares, cubes, and integer square roots (`5^2`, `√64`)
  - `percentage` — `25% of 80` style questions with whole-number answers
  - `pemdas` — three-operand expressions with order of operations and optional parentheses
  - `solve-x` — simple linear equations such as `2x + 3 = 11`
  - `sequence` — arithmetic and geometric progressions (`2, 4, 6, 8, ?`)
- Modulo (`%`) added to the arithmetic operation set
- `QUESTION_TYPES` config option to choose which types are produced
- `registerQuestionType(name, generator)` for plugging in your own question type
- `unregisterQuestionType(name)` and `listQuestionTypes()` companions
- `resetConfig()` to restore default settings
- TypeScript declarations (`index.d.ts`)
- `engines` field in `package.json` declares Node 16 as the minimum
- `exports` and `files` fields so npm publishes only the runtime code

### Changed

- The codebase is split into small focused modules under `src/`. The single 500-line `index.js` is now a 28-line barrel that re-exports everything.
- `generateQuestionWithConstraints` now uses up to 100 attempts when filtering by result bounds (was 10), removing a flaky failure when constraints rejected most candidates.
- Question objects now include a `type` field. Some types also include a `style` field.
- README rewritten in plain English with examples for every question type.

### Fixed

- `package.json` `v2` script ran `v1.test.js` by mistake; it now runs `v2.test.js`. A `v3` script has been added.
- `generateQuestionWithConstraints` no longer mutates global config during execution, so it is safe to call concurrently.
- `validateAnswerWithFeedback` no longer crashes when given `null` or `undefined`.
- `.gitignore` cleaned up and now includes `.DS_Store`.

## [2.0.0] - 2025-07-16

### Added

- `generateMultipleQuestions(count)` for batch generation
- `generateQuestionWithConstraints(options)` to constrain operations, number range and result bounds
- `validateAnswerFlexible(question, answer)` accepts equivalent decimal forms (`4`, `4.0`, `4.00`)
- `validateAnswerWithFeedback(question, answer)` returns a detailed result object
- `validateAnswers(pairs)` for batch validation
- `validateAnswerStrict(question, answer)` exposes the original strict behaviour by name
- `getQuestionStats(question)` and a difficulty score from 1 to 10
- `setConfig` / `getConfig` for runtime configuration
- `normalizeNumericString` helper

### Changed

- Question objects now include `numericAnswer`, `operation`, and `operands` fields alongside `question` and `answer`.

## [1.x] - Initial releases

- `generateRandomMathQuestion()` produces a single arithmetic question
- `validateAnswer(question, answer)` checks the user input
- `checkIfSolvedCorrectly(question, answer)` alias for `validateAnswer`
