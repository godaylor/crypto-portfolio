export function percentDifference(a, b) {
  // return Math.round((a / b) * 100 * 100) / 100;
  return Math.round(100 * Math.abs((a - b) / ((a + b) / 2)) * 100) / 100
}

export function capitalize(str) {
  return str.capitalize()
}
