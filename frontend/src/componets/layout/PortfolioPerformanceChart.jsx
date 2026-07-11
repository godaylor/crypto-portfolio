import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, Segmented, Space, Typography } from 'antd'

import {
  createPortfolioPerformanceDemoSeries,
  performanceRangeOptions,
} from '../../demo/portfolioPerformanceDemoData'
import {
  defaultThemeValues,
  readChartThemeValues,
  withAlpha,
} from './chartTheme'

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
)

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: 'exceptZero',
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

export default function PortfolioPerformanceChart({
  compact = false,
  portfolioBalance,
  portfolioDailyChange,
  portfolioProfit,
  portfolioProfitPercent,
  themeName,
}) {
  const [range, setRange] = useState('30d')
  const [themeValues, setThemeValues] = useState(defaultThemeValues)
  const [chartFrameRef, isChartFrameReady] = useMeasuredChartFrame()

  useLayoutEffect(() => {
    setThemeValues(readChartThemeValues())
  }, [themeName])

  const performanceSeries = useMemo(
    () => createPortfolioPerformanceDemoSeries(portfolioBalance, range),
    [portfolioBalance, range]
  )

  const currentValue =
    performanceSeries[performanceSeries.length - 1]?.value ?? portfolioBalance
  const firstValue = performanceSeries[0]?.value ?? currentValue
  const performanceChange = firstValue
    ? ((currentValue - firstValue) / firstValue) * 100
    : 0
  const performanceStatus = performanceChange >= 0 ? 'positive' : 'negative'
  const highValue = Math.max(...performanceSeries.map((point) => point.value))
  const lowValue = Math.min(...performanceSeries.map((point) => point.value))

  const chartData = useMemo(
    () => ({
      labels: performanceSeries.map((point) => point.label),
      datasets: [
        {
          label: 'Стоимость портфеля',
          data: performanceSeries.map((point) => point.value),
          borderColor: themeValues.accent,
          backgroundColor: (context) => {
            const { chart } = context
            const { chartArea, ctx } = chart

            if (!chartArea) {
              return withAlpha(themeValues.accent, 0.16)
            }

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            )

            gradient.addColorStop(0, withAlpha(themeValues.accent, 0.34))
            gradient.addColorStop(0.62, withAlpha(themeValues.accent2, 0.12))
            gradient.addColorStop(1, withAlpha(themeValues.accent, 0.01))

            return gradient
          },
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: themeValues.surfaceElevated,
          pointBorderColor: themeValues.accent,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: themeValues.accent,
          pointHoverBorderColor: themeValues.textPrimary,
          pointHoverRadius: 6,
          pointRadius: 0,
          tension: 0.38,
        },
      ],
    }),
    [performanceSeries, themeValues]
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 80,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: themeValues.surfaceElevated,
          borderColor: themeValues.borderStrong,
          borderWidth: 1,
          titleColor: themeValues.textPrimary,
          bodyColor: themeValues.textSecondary,
          caretPadding: 8,
          cornerRadius: 12,
          displayColors: false,
          padding: 12,
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y),
          },
        },
      },
      scales: {
        x: {
          border: {
            display: false,
          },
          grid: {
            color: withAlpha(themeValues.textMuted, 0.12),
            drawTicks: false,
          },
          ticks: {
            color: themeValues.textMuted,
            font: {
              size: 11,
              weight: 600,
            },
            padding: 10,
          },
        },
        y: {
          min: lowValue * 0.985,
          max: highValue * 1.015,
          border: {
            display: false,
          },
          grid: {
            color: withAlpha(themeValues.textMuted, 0.16),
            drawTicks: false,
          },
          ticks: {
            color: themeValues.textMuted,
            callback: (value) => formatCompactCurrency(value),
            font: {
              size: 11,
              weight: 600,
            },
            maxTicksLimit: 5,
            padding: 10,
          },
        },
      },
    }),
    [highValue, lowValue, themeValues]
  )

  return (
    <Card
      className={`dashboard-card performance-card${compact ? ' is-compact' : ''}`}
    >
      <div className='card-section-heading performance-card-header'>
        <div>
          <Typography.Title level={4}>Динамика</Typography.Title>

          <Typography.Text>
            {compact
              ? 'Краткая динамика стоимости портфеля'
              : 'Демо-график стоимости на основе текущего баланса'}
          </Typography.Text>
        </div>

        <Segmented
          className='performance-range-control'
          options={performanceRangeOptions}
          value={range}
          onChange={setRange}
        />
      </div>

      <Space className='performance-summary' size={16} wrap>
        <Space direction='vertical' size={0}>
          <Typography.Text>Текущая стоимость</Typography.Text>
          <Typography.Title level={3}>{formatCurrency(currentValue)}</Typography.Title>
        </Space>

        <span className={`performance-change is-${performanceStatus}`}>
          {formatPercent(performanceChange)}%
        </span>
      </Space>

      <div className='performance-chart-wrapper' ref={chartFrameRef}>
        {isChartFrameReady ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <span className='chart-mount-placeholder' aria-hidden='true' />
        )}
      </div>

      {!compact && (
        <div className='performance-stat-row'>
        <div>
          <span>Максимум</span>
          <strong>{formatCurrency(highValue)}</strong>
        </div>
        <div>
          <span>Минимум</span>
          <strong>{formatCurrency(lowValue)}</strong>
        </div>
        <div>
          <span>P/L</span>
          <strong className={portfolioProfit >= 0 ? 'is-positive' : 'is-negative'}>
            {formatCurrency(portfolioProfit)}
          </strong>
        </div>
        <div>
          <span>24 ч</span>
          <strong
            className={portfolioDailyChange >= 0 ? 'is-positive' : 'is-negative'}
          >
            {formatPercent(portfolioDailyChange)}%
          </strong>
        </div>
        <div>
          <span>ROI</span>
          <strong
            className={portfolioProfitPercent >= 0 ? 'is-positive' : 'is-negative'}
          >
            {formatPercent(portfolioProfitPercent)}%
          </strong>
        </div>
        </div>
      )}
    </Card>
  )
}
