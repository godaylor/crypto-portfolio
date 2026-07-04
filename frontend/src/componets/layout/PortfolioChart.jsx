import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartCardStyle = {
  height: '100%',
  background: '#111c2e',
  border: '1px solid #1e293b',
}

const chartWrapperStyle = {
  height: 320,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const chartTitleStyle = {
  color: '#f8fafc',
  marginBottom: 4,
}

const chartSubtitleStyle = {
  color: '#94a3b8',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function PortfolioChart() {
  const { userPortfolio } = useCrypto()

  const chartData = {
    labels: userPortfolio.map((portfolioCoin) => portfolioCoin.name),

    datasets: [
      {
        label: '$',
        data: userPortfolio.map(
          (portfolioCoin) => portfolioCoin.totalAmount
        ),

        backgroundColor: [
          '#f7931a',
          '#627eea',
          '#26a17b',
          '#f3ba2f',
          '#14f195',
          '#23292f',
        ],

        borderColor: '#111c2e',
        borderWidth: 4,
        spacing: 2,
        hoverOffset: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#25344d',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(context.parsed)}`,
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          boxWidth: 10,
          padding: 16,
          usePointStyle: true,
        },
      },
    },
  }

  return (
    <Card className='dashboard-card' style={chartCardStyle}>
      <Typography.Title level={4} style={chartTitleStyle}>
        Распределение активов
      </Typography.Title>

      <Typography.Text style={chartSubtitleStyle}>
        Текущая стоимость по каждой монете
      </Typography.Text>

      <div style={chartWrapperStyle}>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </Card>
  )
}
