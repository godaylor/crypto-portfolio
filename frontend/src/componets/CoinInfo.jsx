import { Flex, Typography } from 'antd'

export default function CoinIfo({ coin, withSymbol }) {
  return (
    <Flex align='center'>
      <img
        src={coin.icon}
        alt={coin.name}
        style={{ width: 40, marginRight: 15}}
      />
      <Typography.Title level={2} style={{ marginBottom: 0, paddingBottom: 3}}>
        {coin.symbol != coin.name
          ? withSymbol && <span>({coin.symbol})</span>
          : null}{' '}
        {coin.name}
      </Typography.Title>
    </Flex>
  )
}
