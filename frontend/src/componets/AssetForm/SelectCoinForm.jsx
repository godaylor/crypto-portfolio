import { SearchOutlined } from '@ant-design/icons'
import { Select, Space, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

function getDrawerPopupContainer(triggerNode) {
  return triggerNode?.closest?.('.ant-drawer-content') ?? document.body
}

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
      getPopupContainer={getDrawerPopupContainer}
      style={{ width: '100%' }}
      onChange={handleSelectChange}
      placeholder='Выберите актив'
      suffixIcon={<SearchOutlined />}
      showSearch
      optionFilterProp='label'
      notFoundContent='Ничего не найдено'
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
