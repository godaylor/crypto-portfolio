import { Divider, Tag, Typography } from 'antd'

import CoinInfo from './CoinInfo'

export default function CoinInfoModal({ coin }) {
  return (
    <>
      <CoinInfo coin={coin} withSymbol />

      <Divider />

      {/* Изменение цены за разные периоды */}
      <Typography.Paragraph>
        <Typography.Text strong>1 Hour: </Typography.Text>
        <Tag color={coin.priceChange1h > 0 ? 'green' : 'red'}>
          {coin.priceChange1h}%
        </Tag>

        <Typography.Text strong>1 Day: </Typography.Text>
        <Tag color={coin.priceChange1d > 0 ? 'green' : 'red'}>
          {coin.priceChange1d}%
        </Tag>

        <Typography.Text strong>1 Week: </Typography.Text>
        <Tag color={coin.priceChange1w > 0 ? 'green' : 'red'}>
          {coin.priceChange1w}%
        </Tag>
      </Typography.Paragraph>

      {coin.price && (
        <Typography.Paragraph>
          <Typography.Text strong>Price: </Typography.Text>
          {coin.price.toFixed(2)} $
        </Typography.Paragraph>
      )}

      {coin.priceBtc && (
        <Typography.Paragraph>
          <Typography.Text strong>Price BTC: </Typography.Text>
          {coin.priceBtc}
        </Typography.Paragraph>
      )}

      {coin.marketCap && (
        <Typography.Paragraph>
          <Typography.Text strong>Market Cap: </Typography.Text>
          {coin.marketCap} $
        </Typography.Paragraph>
      )}

      {coin.contractAddress && (
        <Typography.Paragraph>
          <Typography.Text strong>Contract Address: </Typography.Text>
          {coin.contractAddress}
        </Typography.Paragraph>
      )}
    </>
  )
}