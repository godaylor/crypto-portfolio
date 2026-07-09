import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Result, Space, Typography } from 'antd'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function CoinAddedMessage({
  coinToAdd,
  coin,
  closeCoinDrawer,
  setCoin,
  setIsCoinAdded,
}) {
  function addAnotherCoin() {
    setIsCoinAdded(false)
    setCoin(null)
  }

  const total = coinToAdd.amount * coinToAdd.price

  return (
    <div className='coin-added-result'>
      <Result
        icon={<CheckCircleOutlined />}
        status='success'
        title='Asset added'
        subTitle='The purchase is saved in your portfolio and reflected in the dashboard.'
      />

      <div className='coin-added-summary'>
        <Flex align='center' gap={12}>
          <img
            className='coin-added-summary-icon'
            src={coin.icon}
            alt={coin.name}
          />

          <Space direction='vertical' size={0}>
            <Typography.Text strong>{coin.name}</Typography.Text>
            <Typography.Text type='secondary'>{coin.symbol}</Typography.Text>
          </Space>
        </Flex>

        <div className='coin-added-summary-grid'>
          <Space direction='vertical' size={2}>
            <Typography.Text type='secondary'>Amount</Typography.Text>
            <Typography.Text strong>
              {coinToAdd.amount} {coin.symbol}
            </Typography.Text>
          </Space>

          <Space direction='vertical' size={2}>
            <Typography.Text type='secondary'>Buy price</Typography.Text>
            <Typography.Text strong>
              {formatCurrency(coinToAdd.price)}
            </Typography.Text>
          </Space>

          <Space direction='vertical' size={2}>
            <Typography.Text type='secondary'>Total</Typography.Text>
            <Typography.Text strong>{formatCurrency(total)}</Typography.Text>
          </Space>
        </div>
      </div>

      <Flex className='coin-added-actions' justify='flex-end' gap={12}>
        <Button onClick={addAnotherCoin}>Add another</Button>

        <Button type='primary' onClick={closeCoinDrawer}>
          Close
        </Button>
      </Flex>
    </div>
  )
}
