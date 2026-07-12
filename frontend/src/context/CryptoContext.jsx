import { createContext, useContext, useEffect, useState } from 'react'

import {
  fetchUserPortfolio,
  fetchMarketCoins,
} from '../api'
import { percentDifference } from '../utils'

const CryptoContext = createContext({
  userPortfolio: [],
  marketCoins: [],
  loading: false,
  addCoinToPortfolio: () => {},
  removeCoinFromPortfolio: () => {},
  resetDemoData: () => {},
})

function getPortfolioEntryId(portfolioCoin, index) {
  if (portfolioCoin.entryId) {
    return portfolioCoin.entryId
  }

  const dateValue =
    portfolioCoin.date instanceof Date
      ? portfolioCoin.date.toISOString()
      : portfolioCoin.date ?? 'no-date'

  return `${portfolioCoin.id}-${dateValue}-${index}`
}

export function CryptoContextProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [marketCoins, setMarketCoins] = useState([])
  const [userPortfolio, setUserPortfolio] = useState([])

  // Combine portfolio entries with current market data and derived metrics.
  function preparePortfolio(userPortfolio, marketCoins) {
    return userPortfolio.map((portfolioCoin, index) => {
      const marketCoin = marketCoins.find(
        (marketCoin) => marketCoin.id === portfolioCoin.id
      )

      if (!marketCoin) {
        return {
          ...portfolioCoin,
          entryId: getPortfolioEntryId(portfolioCoin, index),
          grow: false,
          growPercent: 0,
          name: portfolioCoin.name ?? portfolioCoin.id,
          totalAmount: portfolioCoin.amount * portfolioCoin.price,
          totalProfit: 0,
        }
      }

      return {
        entryId: getPortfolioEntryId(portfolioCoin, index),
        grow: portfolioCoin.price < marketCoin.price,
        growPercent: percentDifference(
          portfolioCoin.price,
          marketCoin.price
        ),
        totalAmount: portfolioCoin.amount * marketCoin.price,
        totalProfit:
          portfolioCoin.amount * marketCoin.price -
          portfolioCoin.amount * portfolioCoin.price,
        name: marketCoin.name,
        ...portfolioCoin,
      }
    })
  }

  async function resetDemoData() {
    setLoading(true)

    const fetchedPortfolio = await fetchUserPortfolio()
    const fetchedMarketCoins = await fetchMarketCoins()

    setUserPortfolio(preparePortfolio(fetchedPortfolio, fetchedMarketCoins))
    setMarketCoins(fetchedMarketCoins)
    setLoading(false)
  }

  // Load demo data on the first application render.
  useEffect(() => {
    resetDemoData()
  }, [])

  // Add a new purchase to the current portfolio state.
  function addCoinToPortfolio(newPortfolioCoin) {
    setUserPortfolio((previousPortfolio) =>
      preparePortfolio(
        [
          ...previousPortfolio,
          {
            ...newPortfolioCoin,
            entryId:
              newPortfolioCoin.entryId ??
              `${newPortfolioCoin.id}-${Date.now()}`,
          },
        ],
        marketCoins
      )
    )
  }

  function removeCoinFromPortfolio(entryId) {
    setUserPortfolio((previousPortfolio) =>
      previousPortfolio.filter(
        (portfolioCoin) => portfolioCoin.entryId !== entryId
      )
    )
  }

  return (
    <CryptoContext.Provider
      value={{
        loading,
        marketCoins,
        userPortfolio,
        addCoinToPortfolio,
        removeCoinFromPortfolio,
        resetDemoData,
      }}
    >
      {children}
    </CryptoContext.Provider>
  )
}

export default CryptoContext

export function useCrypto() {
  return useContext(CryptoContext)
}
