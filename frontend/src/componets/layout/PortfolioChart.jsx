import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'

import { useCrypto } from '../../context/CryptoContext'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PortfolioChart() {
  const { userPortfolio } = useCrypto()

  // Подготавливаем данные
  // для построения круговой диаграммы.
  const chartData = {
    labels: userPortfolio.map((portfolioCoin) => portfolioCoin.name),

    datasets: [
      {
        label: '$',
        data: userPortfolio.map(
          (portfolioCoin) => portfolioCoin.totalAmount
        ),

        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],

        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],

        borderWidth: 1,
      },
    ],
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1rem',
        height: 400,
      }}
    >
      <Pie data={chartData} />
    </div>
  )
}