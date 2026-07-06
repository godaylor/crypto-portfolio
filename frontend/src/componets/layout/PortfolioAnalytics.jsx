import {
  BarChartOutlined,
  FundOutlined,
  LineChartOutlined,
  RiseOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Card, Typography } from 'antd'

import AnalyticsCard from './AnalyticsCard'

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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
  }).format(value)
}

function getAssetSignedChange(asset) {
  return asset.grow ? asset.growPercent : -asset.growPercent
}

export default function PortfolioAnalytics({
  portfolioBalance,
  portfolioDailyChange,
  portfolioProfit,
  portfolioProfitPercent,
  stableShare,
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
  const volatility = userPortfolio.length
    ? userPortfolio.reduce(
        (totalVolatility, asset) =>
          totalVolatility + Math.abs(getAssetSignedChange(asset)),
        0
      ) / userPortfolio.length
    : 0

  const sortedAssets = [...userPortfolio].sort(
    (firstAsset, secondAsset) => secondAsset.totalAmount - firstAsset.totalAmount
  )

  const moduleBars = [
    { label: '7Д', value: 28 },
    { label: '30Д', value: 46 },
    { label: '90Д', value: 62 },
    { label: '1Г', value: Math.min(92, 56 + Math.abs(portfolioProfitPercent) * 4) },
  ]

  return (
    <Card className='dashboard-card analytics-suite-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Аналитические модули</Typography.Title>
          <Typography.Text>Доходность, сравнение и риск</Typography.Text>
        </div>

        <span className='module-badge'>Live</span>
      </div>

      <div className='analytics-card-grid'>
        <AnalyticsCard
          title='ROI портфеля'
          value={`${formatPercent(portfolioProfitPercent, {
            signDisplay: 'exceptZero',
          })}%`}
          detail='От вложенной суммы'
          icon={<RiseOutlined />}
          status={getValueStatus(portfolioProfitPercent)}
        />

        <AnalyticsCard
          title='Баланс сейчас'
          value={formatCurrency(portfolioBalance)}
          detail='Рыночная оценка'
          icon={<LineChartOutlined />}
          status='accent'
        />

        <AnalyticsCard
          title='Лучший актив'
          value={bestAsset?.name ?? 'Нет данных'}
          detail={
            bestAsset
              ? `${formatPercent(bestAssetChange, {
                  signDisplay: 'exceptZero',
                })}% к цене покупки`
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

      <div className='analytics-module-grid'>
        <div className='analytics-module income-module'>
          <div className='analytics-module-header'>
            <span>Доходность</span>
            <strong>
              {formatPercent(portfolioDailyChange, {
                signDisplay: 'exceptZero',
              })}
              %
            </strong>
          </div>
          <div className='income-bars'>
            {moduleBars.map((bar) => (
              <span key={bar.label} style={{ '--bar-height': `${bar.value}%` }}>
                <i />
                <em>{bar.label}</em>
              </span>
            ))}
          </div>
        </div>

        <div className='analytics-module compare-module'>
          <div className='analytics-module-header'>
            <span>Сравнение активов</span>
            <FundOutlined />
          </div>

          <div className='compare-bars'>
            {sortedAssets.slice(0, 4).map((asset) => {
              const share = portfolioBalance
                ? (asset.totalAmount / portfolioBalance) * 100
                : 0

              return (
                <div className='compare-row' key={asset.id}>
                  <span>{asset.name}</span>
                  <div>
                    <i style={{ width: `${Math.min(share, 100)}%` }} />
                  </div>
                  <strong>{formatPercent(share)}%</strong>
                </div>
              )
            })}
          </div>
        </div>

        <div className='analytics-module risk-mini-module'>
          <div className='analytics-module-header'>
            <span>Риск / волатильность</span>
            <strong>{formatPercent(volatility)}%</strong>
          </div>
          <div className='risk-mini-track'>
            <span style={{ width: `${Math.min(volatility * 2.6, 100)}%` }} />
          </div>
          <div className='risk-mini-footer'>
            <span>Стейблы {formatPercent(stableShare)}%</span>
            <span>Активов {userPortfolio.length}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
