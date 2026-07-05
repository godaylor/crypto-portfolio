import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartColors = ['#ff9f1a', '#6380f6', '#21d6a3', '#f3ba2f', '#14f195']

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

export default function PortfolioChart({ themeName }) {
  const { userPortfolio } = useCrypto()

  const chartData = {
    labels: userPortfolio.map((portfolioCoin) => portfolioCoin.name),

    datasets: [
      {
        label: '$',
        data: userPortfolio.map(
          (portfolioCoin) => portfolioCoin.totalAmount
        ),
        backgroundColor: chartColors,
        borderColor: getThemeValue('--surface-card', '#111c2e'),
        borderWidth: 5,
        borderRadius: 8,
        spacing: 3,
        hoverOffset: 10,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    animation: {
      animateRotate: true,
      duration: 700,
      easing: 'easeOutQuart',
    },
    plugins: {
      tooltip: {
        backgroundColor: getThemeValue('--surface-elevated', '#0f172a'),
        borderColor: getThemeValue('--border-strong', '#25344d'),
        borderWidth: 1,
        titleColor: getThemeValue('--text-primary', '#f8fafc'),
        bodyColor: getThemeValue('--text-secondary', '#cbd5e1'),
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
          color: getThemeValue('--text-secondary', '#cbd5e1'),
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
  }

  return (
    <Card className='dashboard-card chart-card'>
      <Typography.Title level={4}>Распределение активов</Typography.Title>

      <Typography.Text>
        Текущая стоимость по каждой монете
      </Typography.Text>

      <div className='chart-wrapper' data-theme={themeName}>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </Card>
  )
}
