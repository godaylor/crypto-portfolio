import { Flex, Typography } from 'antd'

export default function CoinInfo({ coin, withSymbol }) {
  return (
    <Flex align='center'>
      <img
        src={coin.icon}
        alt={coin.name}
        style={{
          width: 40,
          marginRight: 15,
        }}
      />

      <Typography.Title
        level={2}
        style={{
          marginBottom: 0,
          paddingBottom: 3,
        }}
      >
        {/* Показываем тикер,
            только если он отличается
            от полного названия монеты. */}
        {coin.symbol !== coin.name &&
          withSymbol && (
            <span>({coin.symbol}) </span>
          )}

        {coin.name}
      </Typography.Title>
    </Flex>
  )
}