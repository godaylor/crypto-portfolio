import { Select, Space } from 'antd'
import { useCrypto } from '../../context/CryptoContext'

export default function SelectAssetForm({ setCoin }) {
  const { marketCoins } = useCrypto()
  const handleSelectChange = (value) =>
    value ? setCoin(marketCoins.find((c) => c.id === value)) : setCoin(null)

  return (
    <Select
      style={{ width: '100%' }}
      //   onSelect={handleSelectChange}
      onChange={handleSelectChange}
      placeholder='Select coin'
      options={marketCoins.map((coin) => ({
        label: coin.name,
        value: coin.id,
        icon: coin.icon,
      }))}
      optionRender={(option) => (
        <Space>
          <img
            style={{ width: 20, marginTop: 6 }}
            src={option.data.icon}
            alt={option.data.labbel}
          />
          {option.data.label}
        </Space>
      )}
      allowClear
    />
  )
}
