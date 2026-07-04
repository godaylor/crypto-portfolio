import {
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { Card, Col, Layout, Row, Statistic, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

import AssetsTable from './AssetsTable'
import PortfolioChart from './PortfolioChart'

const contentStyle = {
  minHeight: 'calc(100vh - 72px)',
  backgroundColor: '#08111f',
  padding: '24px',
}

const dashboardHeaderStyle = {
  marginBottom: 24,
}

const dashboardTitleStyle = {
  color: '#f8fafc',
  marginBottom: 4,
}

const dashboardSubtitleStyle = {
  color: '#94a3b8',
}

const dashboardCardStyle = {
  height: '100%',
  background: '#111c2e',
  border: '1px solid #1e293b',
}

function getValueColor(value) {
  if (value > 0) {
    return '#22c55e'
  }

  if (value < 0) {
    return '#ef4444'
  }

  return '#eab308'
}

export default function AppContent() {
  const { userPortfolio, marketCoins } = useCrypto()

  const coinPricesById = marketCoins.reduce((pricesById, marketCoin) => {
    pricesById[marketCoin.id] = marketCoin.price
    return pricesById
  }, {})

  const portfolioBalance = userPortfolio
    .map(
      (portfolioCoin) =>
        portfolioCoin.amount * coinPricesById[portfolioCoin.id]
    )
    .reduce((totalBalance, value) => totalBalance + value, 0)

  const portfolioProfit = userPortfolio
    .map((portfolioCoin) => portfolioCoin.totalProfit)
    .reduce((totalProfit, value) => totalProfit + value, 0)

  const portfolioInvested = userPortfolio
    .map((portfolioCoin) => portfolioCoin.amount * portfolioCoin.price)
    .reduce((totalInvested, value) => totalInvested + value, 0)

  const portfolioProfitPercent = portfolioInvested
    ? (portfolioProfit / portfolioInvested) * 100
    : 0

  const positiveCoinsCount = userPortfolio.filter(
    (portfolioCoin) => portfolioCoin.grow
  ).length

  const profitIcon =
    portfolioProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />

  return (
    <Layout.Content style={contentStyle}>
      <div style={dashboardHeaderStyle}>
        <Typography.Title level={2} style={dashboardTitleStyle}>
          Обзор портфеля
        </Typography.Title>

        <Typography.Text style={dashboardSubtitleStyle}>
          Следите за распределением, доходностью и текущими активами.
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card className='dashboard-card' style={dashboardCardStyle}>
            <Statistic
              title='Общая стоимость'
              value={portfolioBalance}
              precision={2}
              prefix='$'
              valueStyle={{ color: '#f8fafc' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='dashboard-card' style={dashboardCardStyle}>
            <Statistic
              title='Прибыль / убыток'
              value={portfolioProfit}
              precision={2}
              prefix={profitIcon}
              suffix='$'
              valueStyle={{ color: getValueColor(portfolioProfit) }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='dashboard-card' style={dashboardCardStyle}>
            <Statistic
              title='Изменение портфеля'
              value={portfolioProfitPercent}
              precision={2}
              suffix='%'
              valueStyle={{
                color: getValueColor(portfolioProfitPercent),
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='dashboard-card' style={dashboardCardStyle}>
            <Statistic
              title='Активы в плюсе'
              value={positiveCoinsCount}
              suffix={`/ ${userPortfolio.length}`}
              valueStyle={{ color: '#38bdf8' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align='stretch'>
        <Col xs={24} xl={8}>
          <PortfolioChart />
        </Col>

        <Col xs={24} xl={16}>
          <AssetsTable />
        </Col>
      </Row>
    </Layout.Content>
  )
}
