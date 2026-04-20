export function isValidNumericString(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return false;
  return !Number.isNaN(Number(trimmed));
}

export function getDecimalPlaces(numericString) {
  const parts = numericString.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

export function isEffectivelyZero(numericString) {
  return /^0*\.?0*$/.test(numericString.replace('-', ''));
}

export function numbersEqual(a, b, tolerance = 1e-10) {
  return Math.abs(a - b) < tolerance;
}

export function roundToDecimalPlaces(numericString, decimals) {
  const isNegative = numericString.startsWith('-');
  const absoluteString = isNegative ? numericString.slice(1) : numericString;

  let [integerPart, decimalPart = ''] = absoluteString.split('.');
  decimalPart = decimalPart.padEnd(decimals + 1, '0');

  const roundingDigit = parseInt(decimalPart[decimals] || '0', 10);
  let keptDecimals = decimalPart.slice(0, decimals);

  if (roundingDigit >= 5) {
    const carried = addOneToDecimalString(keptDecimals);
    if (carried.overflow) {
      integerPart = (BigInt(integerPart) + 1n).toString();
      keptDecimals = '0'.repeat(decimals);
    } else {
      keptDecimals = carried.result;
    }
  }

  const finalDecimals = keptDecimals.padEnd(decimals, '0');
  let result = decimals > 0 ? `${integerPart}.${finalDecimals}` : integerPart;

  if (isNegative && !isEffectivelyZero(result)) {
    result = `-${result}`;
  }
  return result;
}

export function normalizeNumericString(value) {
  const number = parseFloat(value);
  if (Number.isInteger(number)) return number.toString();
  return number.toString().replace(/\.?0+$/, '');
}

function addOneToDecimalString(decimalString) {
  if (!decimalString) return { result: '1', overflow: true };

  const digits = decimalString.split('').reverse();
  let carry = 1;

  for (let i = 0; i < digits.length && carry; i++) {
    const sum = parseInt(digits[i], 10) + carry;
    digits[i] = (sum % 10).toString();
    carry = Math.floor(sum / 10);
  }

  return {
    result: digits.reverse().join(''),
    overflow: carry > 0,
  };
}
