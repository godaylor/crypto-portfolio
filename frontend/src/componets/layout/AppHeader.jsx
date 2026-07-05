import { useEffect, useState } from 'react'

import {
  BellOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Drawer,
  Flex,
  Layout,
  Modal,
  Select,
  Space,
  Typography,
} from 'antd'

import AddCoinForm from '../AssetForm/AddCoinForm'
import CoinInfoModal from '../CoinInfoModel'
import ThemeSwitcher from '../ThemeSwitcher'

import { useCrypto } from '../../context/CryptoContext'

export default function AppHeader({ themeName, setThemeName }) {
  const { marketCoins } = useCrypto()

  const [coin, setCoin] = useState(null)

  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Горячая клавиша открывает или закрывает поиск монет.
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

  function handleSelect(selectedCoinId) {
    const selectedCoin = marketCoins.find(
      (marketCoin) => marketCoin.id === selectedCoinId
    )

    setCoin(selectedCoin)
    setIsSelectOpen(false)
    setIsModalOpen(true)
  }

  return (
    <Layout.Header className='app-header'>
      <Space className='app-brand header-brand' size={12}>
        <Avatar className='brand-icon' icon={<WalletOutlined />} />
        <Typography.Text strong>Crypto Portfolio</Typography.Text>
      </Space>

      <Select
        className='coin-search-select'
        popupClassName='coin-search-dropdown'
        open={isSelectOpen}
        placeholder='Поиск монеты, например BTC'
        suffixIcon={<SearchOutlined />}
        showSearch
        optionFilterProp='label'
        onSelect={handleSelect}
        onOpenChange={setIsSelectOpen}
        options={marketCoins.map((marketCoin) => ({
          label: marketCoin.name,
          value: marketCoin.id,
          icon: marketCoin.icon,
          symbol: marketCoin.symbol,
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
      />

      <Flex className='header-actions' align='center' gap={10}>
        <ThemeSwitcher themeName={themeName} setThemeName={setThemeName} />

        <Button
          className='header-icon-button'
          icon={<BellOutlined />}
          type='text'
          aria-label='Уведомления'
        />

        <Button
          className='add-coin-button'
          icon={<PlusOutlined />}
          type='primary'
          onClick={() => setIsDrawerOpen(true)}
        >
          Добавить актив
        </Button>
      </Flex>

      <Drawer
        className='add-coin-drawer'
        title='Добавление актива'
        width={560}
        open={isDrawerOpen}
        closeIcon={<CloseOutlined />}
        onClose={() => setIsDrawerOpen(false)}
      >
        <AddCoinForm closeCoinDrawer={() => setIsDrawerOpen(false)} />
      </Drawer>

      <Modal
        className='coin-info-modal'
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <CoinInfoModal coin={coin} />
      </Modal>
    </Layout.Header>
  )
}
