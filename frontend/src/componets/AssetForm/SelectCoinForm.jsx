import { SearchOutlined } from '@ant-design/icons'
import { Select, Space, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

export default function SelectCoinForm({ setCoin }) {
  const { marketCoins } = useCrypto()

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
      className='drawer-coin-select'
      popupClassName='coin-search-dropdown drawer-coin-dropdown'
      getPopupContainer={(triggerNode) =>
        triggerNode?.closest('.add-coin-drawer-root') ?? document.body
      }
      style={{ width: '100%' }}
      onChange={handleSelectChange}
      placeholder='Выберите монету'
      suffixIcon={<SearchOutlined />}
      showSearch
      optionFilterProp='label'
      options={marketCoins.map((coin) => ({
        label: coin.name,
        value: coin.id,
        icon: coin.icon,
        symbol: coin.symbol,
      }))}
      optionRender={(option) => (
        <Space>
          <img
            className='coin-option-icon'
            src={option.data.icon}
            alt={option.data.label}
          />
          <span>{option.data.label}</span>
          <Typography.Text type='secondary'>
            {option.data.symbol}
          </Typography.Text>
        </Space>
      )}
      allowClear
    />
  )
}
