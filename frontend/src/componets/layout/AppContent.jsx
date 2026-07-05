import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PercentageOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Card, Col, Flex, Layout, Row, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

import AssetsTable from './AssetsTable'
import PortfolioChart from './PortfolioChart'

function getValueStatus(value) {
  if (value > 0) {
    return 'positive'
  }

  if (value < 0) {
    return 'negative'
  }

  return 'neutral'
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

function KpiCard({ title, value, suffix, icon, status = 'neutral' }) {
  return (
    <Card className='dashboard-card kpi-card'>
      <Flex className='kpi-card-content' align='center' gap={16}>
        <span className={`kpi-icon is-${status}`}>{icon}</span>

        <div>
          <Typography.Text className='kpi-label'>{title}</Typography.Text>

          <Typography.Title className={`kpi-value is-${status}`} level={3}>
            {value}
            {suffix && <span>{suffix}</span>}
          </Typography.Title>
        </div>
      </Flex>
    </Card>
  )
}

export default function AppContent({ themeName }) {
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
    <Layout.Content className='dashboard-content'>
      <div className='dashboard-inner'>
        <div className='dashboard-header'>
          <Typography.Title level={2}>Обзор портфеля</Typography.Title>

          <Typography.Text>
            Следите за распределением, доходностью и текущими активами.
          </Typography.Text>
        </div>

        <Row className='kpi-grid' gutter={[18, 18]}>
          <Col xs={24} md={12} xl={6}>
            <KpiCard
              title='Общая стоимость'
              value={formatNumber(portfolioBalance)}
              icon={<WalletOutlined />}
            />
          </Col>

          <Col xs={24} md={12} xl={6}>
            <KpiCard
              title='Прибыль / убыток'
              value={formatNumber(portfolioProfit)}
              suffix=' $'
              icon={profitIcon}
              status={getValueStatus(portfolioProfit)}
            />
          </Col>

          <Col xs={24} md={12} xl={6}>
            <KpiCard
              title='Изменение портфеля'
              value={formatNumber(portfolioProfitPercent)}
              suffix=' %'
              icon={<PercentageOutlined />}
              status={getValueStatus(portfolioProfitPercent)}
            />
          </Col>

          <Col xs={24} md={12} xl={6}>
            <KpiCard
              title='Активы в плюсе'
              value={positiveCoinsCount}
              suffix={` / ${userPortfolio.length}`}
              icon={<TrophyOutlined />}
              status='accent'
            />
          </Col>
        </Row>

        <Row className='portfolio-grid' gutter={[18, 18]} align='stretch'>
          <Col xs={24} xl={8}>
            <PortfolioChart themeName={themeName} />
          </Col>

          <Col xs={24} xl={16}>
            <AssetsTable />
          </Col>
        </Row>
      </div>
    </Layout.Content>
  )
}
