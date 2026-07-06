import { useLayoutEffect, useMemo, useState } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'
import {
  chartColorPalettes,
  defaultThemeValues,
  readChartThemeValues,
} from './chartTheme'

ChartJS.register(ArcElement, Tooltip, Legend)

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

export default function PortfolioChart({ themeName }) {
  const { userPortfolio, marketCoins } = useCrypto()

  const [themeValues, setThemeValues] = useState(defaultThemeValues)

  useLayoutEffect(() => {
    setThemeValues(readChartThemeValues())
  }, [themeName])

  const chartColors =
    chartColorPalettes[themeName] ?? chartColorPalettes['dark-modern']

  const portfolioBalance = useMemo(
    () =>
      userPortfolio
        .map((portfolioCoin) => portfolioCoin.totalAmount)
        .reduce((totalBalance, value) => totalBalance + value, 0),
    [userPortfolio]
  )

  const allocationRows = useMemo(
    () =>
      [...userPortfolio]
        .sort(
          (firstAsset, secondAsset) =>
            secondAsset.totalAmount - firstAsset.totalAmount
        )
        .map((portfolioCoin, index) => {
          const marketCoin = marketCoins.find(
            (coin) => coin.id === portfolioCoin.id
          )

          return {
            color: chartColors[index % chartColors.length],
            icon: marketCoin?.icon,
            name: portfolioCoin.name,
            symbol: marketCoin?.symbol,
            value: portfolioCoin.totalAmount,
            percent: portfolioBalance
              ? (portfolioCoin.totalAmount / portfolioBalance) * 100
              : 0,
          }
        }),
    [chartColors, marketCoins, portfolioBalance, userPortfolio]
  )

  const chartData = useMemo(
    () => ({
      labels: allocationRows.map((portfolioCoin) => portfolioCoin.name),

      datasets: [
        {
          label: '$',
          data: allocationRows.map((portfolioCoin) => portfolioCoin.value),
          backgroundColor: allocationRows.map((asset) => asset.color),
          borderColor: themeValues.surfaceCard,
          borderWidth: 5,
          borderRadius: 8,
          spacing: 3,
          hoverOffset: 10,
        },
      ],
    }),
    [allocationRows, themeValues.surfaceCard]
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 80,
      cutout: '71%',
      animation: {
        animateRotate: true,
        duration: 650,
        easing: 'easeOutQuart',
      },
      plugins: {
        tooltip: {
          backgroundColor: themeValues.surfaceElevated,
          borderColor: themeValues.borderStrong,
          borderWidth: 1,
          titleColor: themeValues.textPrimary,
          bodyColor: themeValues.textSecondary,
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          callbacks: {
            label: (context) =>
              `${context.label}: ${formatCurrency(context.parsed)}`,
          },
        },
        legend: {
          display: false,
        },
      },
    }),
    [themeValues]
  )

  const topAsset = allocationRows[0]
  const smallPositions = allocationRows.filter((asset) => asset.percent < 10)
    .length

  return (
    <Card className='dashboard-card chart-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Распределение активов</Typography.Title>

          <Typography.Text>Текущая стоимость по каждой монете</Typography.Text>
        </div>

        <span className='module-badge'>{allocationRows.length} активов</span>
      </div>

      <div className='allocation-card-layout'>
        <div className='chart-wrapper allocation-chart-wrapper' data-theme={themeName}>
          <Doughnut
            key={`${themeName}-${themeValues.surfaceCard}-${themeValues.textSecondary}`}
            data={chartData}
            options={chartOptions}
            redraw
          />
          <div className='allocation-center'>
            <strong>{topAsset ? `${formatPercent(topAsset.percent)}%` : '0%'}</strong>
            <span>{topAsset?.symbol ?? 'Asset'}</span>
          </div>
        </div>

        <div className='allocation-list'>
          {allocationRows.map((asset) => (
            <div className='allocation-list-item' key={asset.name}>
              <span
                className='allocation-color-dot'
                style={{ '--asset-color': asset.color }}
              />

              {asset.icon && (
                <img
                  className='allocation-asset-icon'
                  src={asset.icon}
                  alt={asset.name}
                />
              )}

              <div className='allocation-asset-meta'>
                <Typography.Text className='allocation-asset-name'>
                  {asset.name}
                </Typography.Text>
                <Typography.Text className='allocation-asset-symbol'>
                  {asset.symbol}
                </Typography.Text>
              </div>

              <div className='allocation-asset-values'>
                <Typography.Text className='allocation-asset-percent'>
                  {formatPercent(asset.percent)}%
                </Typography.Text>
                <Typography.Text className='allocation-asset-value'>
                  {formatCurrency(asset.value)}
                </Typography.Text>
              </div>
            </div>
          ))}
        </div>

        <div className='allocation-summary-grid'>
          <div>
            <span>Всего</span>
            <strong>{formatCurrency(portfolioBalance)}</strong>
          </div>
          <div>
            <span>Лидер</span>
            <strong>{topAsset?.symbol ?? '-'}</strong>
          </div>
          <div>
            <span>Малых долей</span>
            <strong>{smallPositions}</strong>
          </div>
        </div>
      </div>
    </Card>
  )
}
