export const DEFAULT_CONFIG = {
  DIVISION_PRECISION: 2,
  NUMBER_RANGE: { min: 1, max: 100 },
  TOLERANCE: 1e-10,
  OPERATIONS: ['+', '-', '*', '/'],
  QUESTION_TYPES: ['arithmetic'],
  AVOID_DIVISION_BY_ZERO: true,
  AVOID_NEGATIVE_RESULTS: true,
  MAX_ATTEMPTS: 10,
};

let activeConfig = cloneConfig(DEFAULT_CONFIG);

export function getConfig() {
  return cloneConfig(activeConfig);
}

export function setConfig(updates) {
  if (!updates || typeof updates !== 'object') return;
  Object.assign(activeConfig, updates);
}

export function resetConfig() {
  activeConfig = cloneConfig(DEFAULT_CONFIG);
}

export function snapshotConfig(overrides = {}) {
  return cloneConfig({ ...activeConfig, ...overrides });
}

function cloneConfig(source) {
  return {
    ...source,
    NUMBER_RANGE: { ...source.NUMBER_RANGE },
    OPERATIONS: [...source.OPERATIONS],
    QUESTION_TYPES: [...source.QUESTION_TYPES],
  };
}
