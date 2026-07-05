import { useMemo } from 'react'

import { Avatar, Card, Space, Table, Tag, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCoinAmount(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 8,
  }).format(value)
}

function getChangeColor(value) {
  if (value > 0) {
    return 'green'
  }

  if (value < 0) {
    return 'red'
  }

  return 'gold'
}

export default function AssetsTable() {
  const { userPortfolio, marketCoins } = useCrypto()

  const portfolioBalance = useMemo(
    () =>
      userPortfolio
        .map((portfolioCoin) => portfolioCoin.totalAmount)
        .reduce((totalBalance, value) => totalBalance + value, 0),
    [userPortfolio]
  )

  const tableData = useMemo(
    () =>
      [...userPortfolio].map((portfolioCoin, index) => {
        const marketCoin = marketCoins.find(
          (coin) => coin.id === portfolioCoin.id
        )

        return {
          key: `${portfolioCoin.id}-${portfolioCoin.date?.getTime?.() ?? index}-${index}`,
          coinName: portfolioCoin.name,
          coinSymbol: marketCoin?.symbol,
          coinIcon: marketCoin?.icon,
          currentPrice: marketCoin?.price ?? portfolioCoin.price,
          amount: portfolioCoin.amount,
          allocation: portfolioBalance
            ? (portfolioCoin.totalAmount / portfolioBalance) * 100
            : 0,
          totalAmount: portfolioCoin.totalAmount,
          totalProfit: portfolioCoin.totalProfit,
          growPercent: portfolioCoin.growPercent,
        }
      }),
    [marketCoins, portfolioBalance, userPortfolio]
  )

  const columns = [
    {
      title: 'Монета',
      dataIndex: 'coinName',
      sorter: (a, b) => a.coinName.localeCompare(b.coinName),
      render: (_, coin) => (
        <Space>
          <Avatar src={coin.coinIcon} alt={coin.coinName} size={38}>
            {coin.coinSymbol}
          </Avatar>

          <Space direction='vertical' size={0}>
            <Typography.Text strong>{coin.coinName}</Typography.Text>
            <Typography.Text type='secondary'>
              {coin.coinSymbol}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'currentPrice',
      sorter: (a, b) => a.currentPrice - b.currentPrice,
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Количество',
      dataIndex: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => formatCoinAmount(amount),
    },
    {
      title: 'Доля',
      dataIndex: 'allocation',
      sorter: (a, b) => a.allocation - b.allocation,
      render: (allocation) => `${allocation.toFixed(2)}%`,
    },
    {
      title: 'Стоимость',
      dataIndex: 'totalAmount',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (totalAmount) => (
        <Typography.Text strong>
          {formatCurrency(totalAmount)}
        </Typography.Text>
      ),
    },
    {
      title: 'Прибыль / убыток',
      dataIndex: 'totalProfit',
      sorter: (a, b) => a.totalProfit - b.totalProfit,
      render: (totalProfit, coin) => (
        <Space>
          <Typography.Text
            type={
              totalProfit > 0
                ? 'success'
                : totalProfit < 0
                  ? 'danger'
                  : 'warning'
            }
          >
            {formatCurrency(totalProfit)}
          </Typography.Text>

          <Tag color={getChangeColor(totalProfit)}>
            {coin.growPercent}%
          </Tag>
        </Space>
      ),
    },
  ]

  return (
    <Card className='dashboard-card holdings-card'>
      <Typography.Title level={4}>Мои активы</Typography.Title>

      <Typography.Text>
        Текущие позиции, стоимость и результат
      </Typography.Text>

      <Table
        className='holdings-table'
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey='key'
        scroll={{ x: 760 }}
      />
    </Card>
  )
}
