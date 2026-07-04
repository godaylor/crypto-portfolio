import { Card, Divider, Flex, Space, Tag, Typography } from 'antd'

import CoinInfo from './CoinInfo'

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatLargeNumber(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value)
}

function getChangeColor(value) {
  return value > 0 ? 'green' : 'red'
}

export default function CoinInfoModal({ coin }) {
  return (
    <Space className='coin-info-content' direction='vertical' size={18}>
      <CoinInfo coin={coin} withSymbol />

      <Divider />

      <Card className='coin-info-card'>
        <Typography.Text type='secondary'>
          Динамика цены
        </Typography.Text>

        <Flex gap={10} wrap='wrap' style={{ marginTop: 12 }}>
          <Tag color={getChangeColor(coin.priceChange1h)}>
            1 час: {coin.priceChange1h}%
          </Tag>

          <Tag color={getChangeColor(coin.priceChange1d)}>
            1 день: {coin.priceChange1d}%
          </Tag>

          <Tag color={getChangeColor(coin.priceChange1w)}>
            1 неделя: {coin.priceChange1w}%
          </Tag>
        </Flex>
      </Card>

      <Space direction='vertical' size={10}>
        {coin.price && (
          <Flex justify='space-between' gap={24}>
            <Typography.Text type='secondary'>Цена</Typography.Text>
            <Typography.Text strong>
              {formatCurrency(coin.price)}
            </Typography.Text>
          </Flex>
        )}

        {coin.priceBtc && (
          <Flex justify='space-between' gap={24}>
            <Typography.Text type='secondary'>Цена в BTC</Typography.Text>
            <Typography.Text strong>{coin.priceBtc}</Typography.Text>
          </Flex>
        )}

        {coin.marketCap && (
          <Flex justify='space-between' gap={24}>
            <Typography.Text type='secondary'>
              Рыночная капитализация
            </Typography.Text>
            <Typography.Text strong>
              ${formatLargeNumber(coin.marketCap)}
            </Typography.Text>
          </Flex>
        )}

        {coin.contractAddress && (
          <Space direction='vertical' size={4}>
            <Typography.Text type='secondary'>
              Контракт
            </Typography.Text>
            <Typography.Text copyable className='contract-address'>
              {coin.contractAddress}
            </Typography.Text>
          </Space>
        )}
      </Space>
    </Space>
  )
}
