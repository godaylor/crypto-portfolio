import {
  BarChartOutlined,
  LineChartOutlined,
  RiseOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Col, Row } from 'antd'

import AnalyticsCard from './AnalyticsCard'
import PortfolioPerformanceChart from './PortfolioPerformanceChart'

function getValueStatus(value) {
  if (value > 0) {
    return 'positive'
  }

  if (value < 0) {
    return 'negative'
  }

  return 'neutral'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value)
}

function getAssetSignedChange(asset) {
  return asset.grow ? asset.growPercent : -asset.growPercent
}

export default function PortfolioAnalytics({
  portfolioBalance,
  portfolioProfit,
  portfolioProfitPercent,
  themeName,
  userPortfolio,
}) {
  const averageProfit = userPortfolio.length
    ? portfolioProfit / userPortfolio.length
    : 0
  const bestAsset = [...userPortfolio].sort(
    (firstAsset, secondAsset) =>
      getAssetSignedChange(secondAsset) - getAssetSignedChange(firstAsset)
  )[0]
  const bestAssetChange = bestAsset ? getAssetSignedChange(bestAsset) : 0

  return (
    <Row className='analytics-grid' gutter={[16, 16]} align='stretch'>
      <Col xs={24} xl={16}>
        <PortfolioPerformanceChart
          portfolioBalance={portfolioBalance}
          themeName={themeName}
        />
      </Col>

      <Col xs={24} xl={8}>
        <div className='analytics-card-grid'>
          <AnalyticsCard
            title='ROI портфеля'
            value={`${formatPercent(portfolioProfitPercent)}%`}
            detail='От вложенной суммы'
            icon={<RiseOutlined />}
            status={getValueStatus(portfolioProfitPercent)}
          />

          <AnalyticsCard
            title='Баланс сейчас'
            value={formatCurrency(portfolioBalance)}
            detail='Текущая рыночная оценка'
            icon={<LineChartOutlined />}
            status='accent'
          />

          <AnalyticsCard
            title='Лучший актив'
            value={bestAsset?.name ?? 'Нет данных'}
            detail={
              bestAsset
                ? `${formatPercent(bestAssetChange)}% к цене покупки`
                : 'Добавьте активы'
            }
            icon={<TrophyOutlined />}
            status={bestAsset ? getValueStatus(bestAssetChange) : 'neutral'}
          />

          <AnalyticsCard
            title='Средний P/L'
            value={formatCurrency(averageProfit)}
            detail='На один актив'
            icon={<BarChartOutlined />}
            status={getValueStatus(averageProfit)}
          />
        </div>
      </Col>
    </Row>
  )
}
