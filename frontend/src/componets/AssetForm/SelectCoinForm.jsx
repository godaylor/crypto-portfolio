import { Select, Space } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

export default function SelectCoinForm({ setCoin }) {
  const { marketCoins } = useCrypto()

  // После выбора монеты сохраняем её
  // в состоянии родительского компонента.
  function handleSelectChange(selectedCoinId) {
    if (!selectedCoinId) {
      setCoin(null)
      return
    }

    const selectedCoin = marketCoins.find(
      (coin) => coin.id === selectedCoinId
    )

    setCoin(selectedCoin)
  }

  return (
    <Select
      style={{ width: '100%' }}
      onChange={handleSelectChange}
      placeholder='Select coin'
      options={marketCoins.map((coin) => ({
        label: coin.name,
        value: coin.id,
        icon: coin.icon,
      }))}
      // Отображаем иконку и название
      // каждой монеты в списке.
      optionRender={(option) => (
        <Space>
          <img
            style={{ width: 20, marginTop: 6 }}
            src={option.data.icon}
            alt={option.data.label}
          />
          {option.data.label}
        </Space>
      )}
      // Позволяет очистить выбранную монету
      // и вернуться к пустой форме.
      allowClear
    />
  )
}