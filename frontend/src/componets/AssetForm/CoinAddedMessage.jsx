import { Button, Result } from 'antd'

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

  return (
    <Result
      className='coin-added-result'
      status='success'
      title='Монета добавлена'
      subTitle={`В портфель добавлено ${coinToAdd.amount} ${coin.name}. Цена покупки: $${coinToAdd.price}.`}
      extra={[
        <Button type='primary' key='close' onClick={closeCoinDrawer}>
          Закрыть
        </Button>,

        <Button key='add-more' onClick={addAnotherCoin}>
          Добавить еще
        </Button>,
      ]}
    />
  )
}
