import { Avatar, Flex, Space, Typography } from 'antd'

export default function CoinInfo({ coin, withSymbol }) {
  if (!coin) {
    return null
  }

  return (
    <Flex align='center' gap={14}>
      <Avatar src={coin.icon} alt={coin.name} size={44}>
        {coin.symbol}
      </Avatar>

      <Space direction='vertical' size={0}>
        <Typography.Title level={withSymbol ? 3 : 4}>
          {coin.name}
        </Typography.Title>

        {coin.symbol !== coin.name && withSymbol && (
          <Typography.Text type='secondary'>
            Тикер: {coin.symbol}
          </Typography.Text>
        )}
      </Space>
    </Flex>
  )
}
