import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

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
  }).format(value)
}

function useMeasuredChartFrame() {
  const frameRef = useRef(null)
  const [isFrameReady, setIsFrameReady] = useState(false)

  useEffect(() => {
    let animationFrameId = 0
    let isActive = true

    function updateFrameReadiness() {
      const frameElement = frameRef.current
      const frameRect = frameElement?.getBoundingClientRect()
      const isReady =
        Boolean(frameElement?.isConnected) &&
        Number.isFinite(frameRect?.width) &&
        Number.isFinite(frameRect?.height) &&
        frameRect.width > 0 &&
        frameRect.height > 0

      if (isActive) {
        setIsFrameReady((currentValue) =>
          currentValue === isReady ? currentValue : isReady
        )
      }
    }

    function scheduleReadinessUpdate() {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(updateFrameReadiness)
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleReadinessUpdate)
        : null

    if (frameRef.current && resizeObserver) {
      resizeObserver.observe(frameRef.current)
    }

    scheduleReadinessUpdate()
    window.addEventListener('resize', scheduleReadinessUpdate)

    return () => {
      isActive = false
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', scheduleReadinessUpdate)
      resizeObserver?.disconnect()
    }
  }, [])

  return [frameRef, isFrameReady]
}

export default function PortfolioChart({ compact = false, onNavigate, themeName }) {
  const { userPortfolio, marketCoins } = useCrypto()

  const [themeValues, setThemeValues] = useState(defaultThemeValues)
  const [chartFrameRef, isChartFrameReady] = useMeasuredChartFrame()

  useLayoutEffect(() => {
    setThemeValues(readChartThemeValues())
  }, [themeName])

  const chartColors =
    chartColorPalettes[themeName] ?? chartColorPalettes['premium-dark']

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
  const visibleAllocationRows = compact
    ? allocationRows.slice(0, 4)
    : allocationRows
  const hiddenPositionsCount = allocationRows.length - visibleAllocationRows.length

  return (
    <Card
      className={
        compact
          ? 'dashboard-card chart-card is-compact-allocation'
          : 'dashboard-card chart-card is-deep-allocation'
      }
    >
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>
            {compact ? 'Структура портфеля' : 'Аллокация'}
          </Typography.Title>

          <Typography.Text>
            {compact
              ? 'Краткая сводка по крупнейшим позициям'
              : 'Распределение текущей стоимости по активам'}
          </Typography.Text>
        </div>

        {onNavigate && (
          <button
            className='module-link-button'
            type='button'
            onClick={() => onNavigate('analytics')}
          >
            Подробнее
          </button>
        )}
      </div>

      <div className='allocation-card-layout'>
        <div
          className='chart-wrapper allocation-chart-wrapper'
          data-theme={themeName}
          ref={chartFrameRef}
        >
          {isChartFrameReady ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <span className='chart-mount-placeholder' aria-hidden='true' />
          )}
          <div className='allocation-center'>
            <strong>{topAsset ? `${formatPercent(topAsset.percent)}%` : '0%'}</strong>
            <span>{topAsset?.symbol ?? 'Актив'}</span>
          </div>
        </div>

        <div className='allocation-list'>
          {visibleAllocationRows.map((asset) => (
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

          {compact && hiddenPositionsCount > 0 && (
            <div className='allocation-more-row'>
              Еще {hiddenPositionsCount} поз.
            </div>
          )}
        </div>

        {!compact && (
          <div className='allocation-summary-grid'>
            <div>
              <span>Итого</span>
              <strong>{formatCurrency(portfolioBalance)}</strong>
            </div>
            <div>
              <span>Лидер</span>
              <strong>{topAsset?.symbol ?? '-'}</strong>
            </div>
            <div>
              <span>Малые позиции</span>
              <strong>{smallPositions}</strong>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
