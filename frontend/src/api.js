import { userPortfolio, marketCoins } from './data'

export function fetchUserPortfolio() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(userPortfolio)
    }, 1)
  })
}

export function fakeCurrentPrices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(marketCoins)
    }, 1)
  })
}
