export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(items) {
  return items[randomInt(0, items.length - 1)];
}

export function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function randomIntInRange(range) {
  return randomInt(range.min, range.max);
}
