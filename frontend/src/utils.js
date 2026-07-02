export function percentDifference(a, b) {
  return Math.round(100 * Math.abs((a - b) / ((a + b) / 2)) * 100) / 100
}
