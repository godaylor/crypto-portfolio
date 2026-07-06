import { useMemo } from 'react'

import { Avatar, Card, Space, Table, Tag, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCoinAmount(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8,
  }).format(value)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
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

  const winnersCount = tableData.filter((coin) => coin.totalProfit > 0).length
  const largestPosition = [...tableData].sort(
    (firstCoin, secondCoin) => secondCoin.allocation - firstCoin.allocation
  )[0]

  const columns = [
    {
      title: 'Монета',
      dataIndex: 'coinName',
      sorter: (a, b) => a.coinName.localeCompare(b.coinName),
      render: (_, coin) => (
        <Space className='asset-cell asset-cell-coin'>
          <Avatar
            className='asset-token-icon'
            src={coin.coinIcon}
            alt={coin.coinName}
            size={34}
          >
            {coin.coinSymbol}
          </Avatar>

          <Space direction='vertical' size={0}>
            <Typography.Text className='asset-name' strong>
              {coin.coinName}
            </Typography.Text>
            <Typography.Text className='asset-symbol' type='secondary'>
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
      render: (allocation) => (
        <div className='asset-allocation-cell'>
          <span>{formatPercent(allocation)}%</span>
          <i>
            <b style={{ width: `${Math.min(allocation, 100)}%` }} />
          </i>
        </div>
      ),
    },
    {
      title: 'Стоимость',
      dataIndex: 'totalAmount',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (totalAmount) => (
        <Typography.Text className='asset-amount' strong>
          {formatCurrency(totalAmount)}
        </Typography.Text>
      ),
    },
    {
      title: 'Прибыль / убыток',
      dataIndex: 'totalProfit',
      sorter: (a, b) => a.totalProfit - b.totalProfit,
      render: (totalProfit, coin) => {
        const signedChange = totalProfit >= 0 ? coin.growPercent : -coin.growPercent

        return (
          <Space className='asset-profit-cell' size={8}>
            <Typography.Text
              className='asset-profit-value'
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

            <Tag className='asset-change-tag' color={getChangeColor(totalProfit)}>
              {formatPercent(signedChange, { signDisplay: 'exceptZero' })}%
            </Tag>
          </Space>
        )
      },
    },
  ]

  return (
    <Card className='dashboard-card holdings-card'>
      <div className='card-section-heading holdings-heading'>
        <div>
          <Typography.Title level={4}>Мои активы</Typography.Title>

          <Typography.Text>
            Текущие позиции, стоимость и результат
          </Typography.Text>
        </div>

        <span className='module-badge'>{tableData.length} позиции</span>
      </div>

      <div className='holdings-summary-strip'>
        <div>
          <span>Общая стоимость</span>
          <strong>{formatCurrency(portfolioBalance)}</strong>
        </div>
        <div>
          <span>В плюсе</span>
          <strong>{winnersCount}/{tableData.length}</strong>
        </div>
        <div>
          <span>Крупнейшая доля</span>
          <strong>{largestPosition?.coinSymbol ?? '-'}</strong>
        </div>
        <div>
          <span>Концентрация</span>
          <strong>
            {largestPosition ? `${formatPercent(largestPosition.allocation)}%` : '0%'}
          </strong>
        </div>
      </div>

      <Table
        className='holdings-table'
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey='key'
        size='middle'
        scroll={{ x: 760 }}
      />
    </Card>
  )
}
