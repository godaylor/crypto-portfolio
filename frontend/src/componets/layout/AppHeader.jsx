import { useEffect, useState } from 'react'

import {
  BellOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
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
import BrandLockup from './BrandLockup'

import { useCrypto } from '../../context/CryptoContext'

export default function AppHeader({ themeName, setThemeName }) {
  const { marketCoins } = useCrypto()

  const [coin, setCoin] = useState(null)

  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsHeaderCompact(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

  function getDrawerContainer() {
    return document.querySelector('.app-shell') ?? document.body
  }

  const addAssetDrawerTitle = (
    <Flex className='add-coin-drawer-title' align='center' gap={12}>
      <span className='add-coin-drawer-title-icon'>
        <PlusOutlined />
      </span>

      <Space direction='vertical' size={1}>
        <Typography.Text strong>Добавление актива</Typography.Text>
        <Typography.Text type='secondary'>
          Новая покупка для портфеля
        </Typography.Text>
      </Space>
    </Flex>
  )

  return (
    <Layout.Header
      className={isHeaderCompact ? 'app-header is-compact' : 'app-header'}
    >
      <BrandLockup className='header-brand' />

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
        rootClassName='add-coin-drawer-root'
        title={addAssetDrawerTitle}
        width={560}
        open={isDrawerOpen}
        closeIcon={<CloseOutlined />}
        getContainer={getDrawerContainer}
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
