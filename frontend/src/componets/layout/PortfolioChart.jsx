import { useLayoutEffect, useMemo, useState } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartColorPalettes = {
  'dark-modern': ['#ff9f1a', '#6380f6', '#21d6a3', '#3b82f6', '#14f195'],
  'dark-glass': ['#ffb020', '#6d5dfc', '#2ed3aa', '#38c6ff', '#8b5cf6'],
  'light-modern': ['#ff9f1a', '#4f7cff', '#16b981', '#2563eb', '#7c3aed'],
}

const defaultThemeValues = {
  surfaceCard: '#111c30',
  surfaceElevated: '#101a2c',
  borderStrong: '#25344d',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function getThemeValue(name, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const themeRoot = document.querySelector('.app-shell') ?? document.documentElement
  const value = getComputedStyle(themeRoot)
    .getPropertyValue(name)
    .trim()

  return value || fallback
}

function readChartThemeValues() {
  return {
    surfaceCard: getThemeValue('--surface-card', defaultThemeValues.surfaceCard),
    surfaceElevated: getThemeValue(
      '--surface-elevated',
      defaultThemeValues.surfaceElevated
    ),
    borderStrong: getThemeValue(
      '--border-strong',
      defaultThemeValues.borderStrong
    ),
    textPrimary: getThemeValue('--text-primary', defaultThemeValues.textPrimary),
    textSecondary: getThemeValue(
      '--text-secondary',
      defaultThemeValues.textSecondary
    ),
  }
}

export default function PortfolioChart({ themeName }) {
  const { userPortfolio } = useCrypto()

  const [themeValues, setThemeValues] = useState(defaultThemeValues)

  useLayoutEffect(() => {
    setThemeValues(readChartThemeValues())
  }, [themeName])

  const chartColors =
    chartColorPalettes[themeName] ?? chartColorPalettes['dark-modern']

  const chartData = useMemo(
    () => ({
      labels: userPortfolio.map((portfolioCoin) => portfolioCoin.name),

      datasets: [
        {
          label: '$',
          data: userPortfolio.map(
            (portfolioCoin) => portfolioCoin.totalAmount
          ),
          backgroundColor: chartColors,
          borderColor: themeValues.surfaceCard,
          borderWidth: 5,
          borderRadius: 8,
          spacing: 3,
          hoverOffset: 10,
        },
      ],
    }),
    [chartColors, themeValues.surfaceCard, userPortfolio]
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 80,
      cutout: '70%',
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
          position: 'bottom',
          labels: {
            color: themeValues.textSecondary,
            boxWidth: 10,
            boxHeight: 10,
            padding: 18,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              weight: 600,
            },
          },
        },
      },
    }),
    [themeValues]
  )

  return (
    <Card className='dashboard-card chart-card'>
      <Typography.Title level={4}>Распределение активов</Typography.Title>

      <Typography.Text>
        Текущая стоимость по каждой монете
      </Typography.Text>

      <div className='chart-wrapper' data-theme={themeName}>
        <Doughnut
          key={`${themeName}-${themeValues.surfaceCard}-${themeValues.textSecondary}`}
          data={chartData}
          options={chartOptions}
          redraw
        />
      </div>
    </Card>
  )
}
