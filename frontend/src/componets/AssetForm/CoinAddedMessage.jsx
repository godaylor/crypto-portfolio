import { Button, Result } from 'antd'

export default function CoinAddedMessage({
  coinToAdd,
  coin,
  closeCoinDrawer,
  setCoin,
  setIsCoinAdded,
}) {
  // Возвращаем пользователя
  // к форме добавления новой монеты.
  function addAnotherCoin() {
    setIsCoinAdded(false)
    setCoin(null)
  }

  return (
    <Result
      status='success'
      title='Coin successfully added!'
      subTitle={`Successfully added ${coinToAdd.amount} ${coin.name} to your portfolio. Purchase price: $${coinToAdd.price}`}
      extra={[
        <Button type='primary' key='close' onClick={closeCoinDrawer}>
          Close
        </Button>,

        <Button key='add-more' onClick={addAnotherCoin}>
          Add More
        </Button>,
      ]}
    />
  )
}
