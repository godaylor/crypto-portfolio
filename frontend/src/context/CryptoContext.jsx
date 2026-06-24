import { createContext, useState, useEffect, useContext } from 'react'
import { fetchUserPortfolio, fakeCurrentPrices } from '../api'
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

  function combinePortfolioWithMarket(userPortfolio, marketCoins) {
    return userPortfolio.map((portfolioCoin) => {
      const marketCoin = marketCoins.find(
        (coin) => coin.id === portfolioCoin.id,
      )
      return {
        grow: portfolioCoin.price < marketCoin.price, // boolean
        growPercent: percentDifference(portfolioCoin.price, marketCoin.price),
        totalAmount: portfolioCoin.amount * marketCoin.price,
        totalProfit:
          portfolioCoin.amount * marketCoin.price -
          portfolioCoin.amount * portfolioCoin.price,
        name: marketCoin.name,
        ...portfolioCoin,
      }
    })
  }

  useEffect(() => {
    async function preload() {
      setLoading(true)
      const fetchedPortfolio = await fetchUserPortfolio()
      const fetchedMarketCoins = await fakeCurrentPrices()

      setUserPortfolio(
        combinePortfolioWithMarket(fetchedPortfolio, fetchedMarketCoins),
      )

      setMarketCoins(fetchedMarketCoins)
      setLoading(false)
    }
    preload()
  }, [])

  function addCoinToPortfolio(newPortfolioCoin) {
    setUserPortfolio((prev) =>
      combinePortfolioWithMarket([...prev, newPortfolioCoin], marketCoins),
    )
  }

  return (
    <CryptoContext.Provider
      value={{ loading, marketCoins, userPortfolio, addCoinToPortfolio }}
    >
      {children}
    </CryptoContext.Provider>
  )
}

export default CryptoContext

export function useCrypto() {
  return useContext(CryptoContext)
}
