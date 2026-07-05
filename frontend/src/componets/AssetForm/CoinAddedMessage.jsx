import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Result, Space, Typography } from 'antd'

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
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
        title='Актив добавлен'
        subTitle='Покупка сохранена в портфеле и уже учтена в текущей сводке.'
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
            <Typography.Text type='secondary'>Количество</Typography.Text>
            <Typography.Text strong>
              {coinToAdd.amount} {coin.symbol}
            </Typography.Text>
          </Space>

          <Space direction='vertical' size={2}>
            <Typography.Text type='secondary'>Цена покупки</Typography.Text>
            <Typography.Text strong>
              {formatCurrency(coinToAdd.price)}
            </Typography.Text>
          </Space>

          <Space direction='vertical' size={2}>
            <Typography.Text type='secondary'>Итого</Typography.Text>
            <Typography.Text strong>{formatCurrency(total)}</Typography.Text>
          </Space>
        </div>
      </div>

      <Flex className='coin-added-actions' justify='flex-end' gap={12}>
        <Button onClick={addAnotherCoin}>Добавить еще</Button>

        <Button type='primary' onClick={closeCoinDrawer}>
          Закрыть
        </Button>
      </Flex>
    </div>
  )
}
