import { Layout, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

import AssetsTable from './AssetsTable'
import PortfolioChart from './PortfolioChart'

const contentStyle = {
  textAlign: 'center',
  minHeight: 'calc(100vh - 60px)',
  color: '#fff',
  backgroundColor: '#001529',
  padding: '1rem',
}

export default function AppContent() {
  const { userPortfolio, marketCoins } = useCrypto()

  // Создаём объект, где ключ — id монеты,
  // а значение — её текущая цена.
  const coinPricesById = marketCoins.reduce((pricesById, marketCoin) => {
    pricesById[marketCoin.id] = marketCoin.price
    return pricesById
  }, {})

  // Рассчитываем общую стоимость портфеля.
  const portfolioBalance = userPortfolio
    .map(
      (portfolioCoin) =>
        portfolioCoin.amount * coinPricesById[portfolioCoin.id]
    )
    .reduce((totalBalance, value) => totalBalance + value, 0)
    .toFixed(2)

  return (
    <Layout.Content style={contentStyle}>
      <Typography.Title
        level={3}
        style={{
          textAlign: 'left',
          color: '#fff',
        }}
      >
        Portfolio: {portfolioBalance} $
      </Typography.Title>

      <PortfolioChart />

      <AssetsTable />
    </Layout.Content>
  )
}