export const performanceRangeOptions = [
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'All', value: 'all' },
]

// Demo-only portfolio history. Replace this module with real historical
// portfolio snapshots when that data exists in the app.
const portfolioPerformanceDemoData = {
  '1d': [
    ['00:00', 0.965],
    ['02:00', 0.972],
    ['04:00', 0.981],
    ['06:00', 0.979],
    ['08:00', 0.991],
    ['10:00', 0.998],
    ['12:00', 0.994],
    ['14:00', 1.006],
    ['16:00', 1.015],
    ['18:00', 1.011],
    ['20:00', 1.027],
    ['22:00', 1.034],
    ['24:00', 1.03],
  ],
  '7d': [
    ['Mon', 0.925],
    ['Tue', 0.948],
    ['Wed', 0.936],
    ['Thu', 0.972],
    ['Fri', 0.988],
    ['Sat', 1.016],
    ['Sun', 1.03],
  ],
  '30d': [
    ['1', 0.88],
    ['5', 0.902],
    ['10', 0.934],
    ['15', 0.921],
    ['20', 0.968],
    ['25', 1.006],
    ['30', 1.03],
  ],
  all: [
    ['Jan', 0.72],
    ['Feb', 0.768],
    ['Mar', 0.746],
    ['Apr', 0.804],
    ['May', 0.858],
    ['Jun', 0.921],
    ['Jul', 1.03],
  ],
}

export function createPortfolioPerformanceDemoSeries(portfolioBalance, range) {
  const balance = portfolioBalance > 0 ? portfolioBalance : 10000
  const demoData =
    portfolioPerformanceDemoData[range] ?? portfolioPerformanceDemoData['1d']

  return demoData.map(([label, multiplier]) => ({
    label,
    value: balance * multiplier,
  }))
}
