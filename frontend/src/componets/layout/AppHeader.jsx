import { useEffect, useState } from 'react'

import { Button, Drawer, Layout, Modal, Select, Space } from 'antd'

import AddCoinForm from '../AssetForm/AddCoinForm'
import CoinInfoModal from '../CoinInfoModel'

import { useCrypto } from '../../context/CryptoContext'

const headerStyle = {
  width: '100%',
  height: 60,
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'center',
}

export default function AppHeader() {
  const { marketCoins } = useCrypto()

  const [coin, setCoin] = useState(null)

  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Горячая клавиша "/" открывает
  // или закрывает поиск монет.
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '/') {
        setIsSelectOpen((prev) => !prev)
      }
    }

    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [])

  // После выбора монеты
  // открываем окно с информацией о ней.
  function handleSelect(selectedCoinId) {
    const selectedCoin = marketCoins.find(
      (marketCoin) => marketCoin.id === selectedCoinId,
    )

    setCoin(selectedCoin)
    setIsModalOpen(true)
  }

  return (
    <Layout.Header style={headerStyle}>
      <Select
        style={{ width: 250 }}
        open={isSelectOpen}
        value='Press "/" to open'
        placeholder='Select coin'
        onSelect={handleSelect}
        onClick={() => setIsSelectOpen((prev) => !prev)}
        options={marketCoins.map((marketCoin) => ({
          label: marketCoin.name,
          value: marketCoin.id,
          icon: marketCoin.icon,
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
      />

      <Button type='primary' onClick={() => setIsDrawerOpen(true)}>
        Add Asset
      </Button>

      <Drawer
        title='Add Asset'
        width={600}
        open={isDrawerOpen}
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => setIsDrawerOpen(false)}
      >
        <AddCoinForm closeCoinDrawer={() => setIsDrawerOpen(false)} />
      </Drawer>

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <CoinInfoModal coin={coin} />
      </Modal>
    </Layout.Header>
  )
}
