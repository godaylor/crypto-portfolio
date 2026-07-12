import { useEffect, useRef, useState } from 'react'

import {
  CheckCircleOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
  WalletOutlined,
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

import { useCrypto } from '../../context/CryptoContext'
import BrandLockup from './BrandLockup'

export default function AppHeader({
  isDrawerOpen,
  onCloseDrawer,
  onNavigate,
  onOpenDrawer,
  setThemeName,
  themeName,
}) {
  const { marketCoins } = useCrypto()

  const [coin, setCoin] = useState(null)
  const searchSelectRef = useRef(null)

  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [searchResetKey, setSearchResetKey] = useState(0)
  const [selectedSearchValue, setSelectedSearchValue] = useState(undefined)
  const [searchValue, setSearchValue] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successNotice, setSuccessNotice] = useState(null)

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

  useEffect(() => {
    const handleKeyPress = (event) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

      if (isTyping) {
        return
      }

      if (event.key === '/') {
        event.preventDefault()
        setIsSelectOpen((prev) => !prev)
      }
    }

    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [])

  function clearGlobalSearch() {
    setSelectedSearchValue(undefined)
    setSearchValue('')

    window.requestAnimationFrame(() => {
      setSelectedSearchValue(undefined)
      setSearchValue('')
      searchSelectRef.current?.blur?.()
    })
  }

  function resetGlobalSearchAfterSelect() {
    clearGlobalSearch()
    setSearchResetKey((currentKey) => currentKey + 1)
  }

  function handleSelect(selectedCoinId) {
    const selectedCoin = marketCoins.find(
      (marketCoin) => marketCoin.id === selectedCoinId
    )

    if (!selectedCoin) {
      clearGlobalSearch()
      setIsSelectOpen(false)
      return
    }

    setCoin(selectedCoin)
    resetGlobalSearchAfterSelect()
    setIsSelectOpen(false)
    setIsModalOpen(true)
  }

  function getAppShellContainer() {
    return document.querySelector('.app-shell') ?? document.body
  }

  function handleOpenDrawer() {
    onOpenDrawer()
  }

  useEffect(() => {
    document.body.classList.toggle('is-add-asset-drawer-open', isDrawerOpen)

    return () => {
      document.body.classList.remove('is-add-asset-drawer-open')
    }
  }, [isDrawerOpen])

  useEffect(() => {
    if (!successNotice) {
      return undefined
    }

    const noticeTimer = window.setTimeout(() => {
      setSuccessNotice(null)
    }, 6500)

    return () => {
      window.clearTimeout(noticeTimer)
    }
  }, [successNotice])

  function handleCoinAddedSuccess(successData) {
    setSuccessNotice({
      ...successData,
      id: Date.now(),
    })
  }

  const addAssetDrawerTitle = (
    <Flex className='add-coin-drawer-title' align='center' gap={12}>
      <span className='add-coin-drawer-title-icon'>
        <WalletOutlined />
      </span>

      <Space direction='vertical' size={1}>
        <Typography.Text strong>Новая покупка</Typography.Text>
        <Typography.Text type='secondary'>
          Запишите новую покупку в портфель
        </Typography.Text>
      </Space>
    </Flex>
  )

  return (
    <>
      <Layout.Header
        className={isHeaderCompact ? 'app-header is-compact' : 'app-header'}
      >
      <BrandLockup
        className='header-brand'
        reviewable={false}
        onClick={() => onNavigate('dashboard')}
      />

      <Select
        key={searchResetKey}
        ref={searchSelectRef}
        className='coin-search-select'
        popupClassName='coin-search-dropdown'
        open={isSelectOpen}
        placeholder='Поиск активов, рынков, токенов...'
        suffixIcon={<SearchOutlined />}
        searchValue={searchValue}
        showSearch
        value={selectedSearchValue}
        autoClearSearchValue
        optionFilterProp='label'
        onSearch={setSearchValue}
        onSelect={handleSelect}
        onChange={(value) => {
          if (!value) {
            clearGlobalSearch()
          }
        }}
        onBlur={clearGlobalSearch}
        onOpenChange={(open) => {
          setIsSelectOpen(open)

          if (!open) {
            clearGlobalSearch()
          }
        }}
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
        <ThemeSwitcher
          className='header-theme-switcher'
          themeName={themeName}
          setThemeName={setThemeName}
        />

        <Button
          className='add-coin-button'
          icon={<PlusOutlined />}
          type='primary'
          onClick={handleOpenDrawer}
        >
          Новая покупка
        </Button>
      </Flex>

      </Layout.Header>

      <Button
        className='mobile-add-coin-button'
        icon={<PlusOutlined />}
        type='primary'
        aria-label='Новая покупка'
        onClick={handleOpenDrawer}
      />

      <Drawer
        className='add-coin-drawer'
        rootClassName='add-coin-drawer-root'
        title={addAssetDrawerTitle}
        width={560}
        open={isDrawerOpen}
        closeIcon={<CloseOutlined />}
        destroyOnClose
        onClose={onCloseDrawer}
      >
        <AddCoinForm
          closeCoinDrawer={onCloseDrawer}
          onCoinAddedSuccess={handleCoinAddedSuccess}
        />
      </Drawer>

      {successNotice && (
        <div className='app-success-toast' role='status' aria-live='polite'>
          <span className='app-success-toast-icon'>
            <CheckCircleOutlined />
          </span>

          <Space direction='vertical' size={1}>
            <Typography.Text strong>Актив добавлен</Typography.Text>
            <Typography.Text type='secondary'>
              {successNotice.coin.name} теперь есть в вашем портфеле.
            </Typography.Text>
          </Space>

          <Button
            className='app-success-toast-close'
            icon={<CloseOutlined />}
            type='text'
            aria-label='Закрыть уведомление'
            onClick={() => setSuccessNotice(null)}
          />
        </div>
      )}

      <Modal
        className='coin-info-modal'
        rootClassName='coin-info-modal-root'
        open={isModalOpen}
        footer={null}
        centered
        destroyOnClose
        getContainer={getAppShellContainer}
        afterClose={() => setCoin(null)}
        onCancel={() => {
          clearGlobalSearch()
          setIsModalOpen(false)
        }}
      >
        <CoinInfoModal coin={coin} />
      </Modal>
    </>
  )
}
