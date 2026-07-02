import { createContext, useContext, useEffect, useState } from 'react'

import { fakeCurrentPrices, fetchUserPortfolio } from '../api'
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

  // Объединяем данные портфеля
  // с текущими рыночными ценами
  // и рассчитываем дополнительные показатели.
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

  // Загружаем данные
  // при первом открытии приложения.
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)

      const fetchedPortfolio = await fetchUserPortfolio()
      const fetchedMarketCoins = await fakeCurrentPrices()

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

  // Добавляем новую покупку
  // в портфель пользователя.
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