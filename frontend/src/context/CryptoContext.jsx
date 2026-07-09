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
})

export function CryptoContextProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [marketCoins, setMarketCoins] = useState([])
  const [userPortfolio, setUserPortfolio] = useState([])

  // Combine portfolio entries with current market data and derived metrics.
  function preparePortfolio(userPortfolio, marketCoins) {
    return userPortfolio.map((portfolioCoin) => {
      const marketCoin = marketCoins.find(
        (marketCoin) => marketCoin.id === portfolioCoin.id
      )

      return {
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

  // Load demo data on the first application render.
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)

      const fetchedPortfolio = await fetchUserPortfolio()
      const fetchedMarketCoins = await fetchMarketCoins()

      setUserPortfolio(
        preparePortfolio(
          fetchedPortfolio,
          fetchedMarketCoins
        )
      )

      setMarketCoins(fetchedMarketCoins)
      setLoading(false)
    }

    loadInitialData()
  }, [])

  // Add a new purchase to the current portfolio state.
  function addCoinToPortfolio(newPortfolioCoin) {
    setUserPortfolio((previousPortfolio) =>
      preparePortfolio(
        [...previousPortfolio, newPortfolioCoin],
        marketCoins
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
