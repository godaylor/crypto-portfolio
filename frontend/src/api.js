import { marketCoins, userPortfolio } from './data'

export function fetchUserPortfolio() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(userPortfolio)
    }, 1)
  })
}

export function fetchMarketCoins() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(marketCoins)
    }, 1)
  })
}