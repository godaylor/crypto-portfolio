import { useEffect, useRef, useState } from 'react'

import {
  BellOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
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

import { useCrypto } from '../../context/CryptoContext'
import BrandLockup from './BrandLockup'

export default function AppHeader({
  isDrawerOpen,
  onCloseDrawer,
  onOpenDrawer,
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

  function getOverlayContainer() {
    return document.querySelector('.app-shell') ?? document.body
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
        <PlusOutlined />
      </span>

      <Space direction='vertical' size={1}>
        <Typography.Text strong>Add asset</Typography.Text>
        <Typography.Text type='secondary'>
          Record a new portfolio purchase
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
        key={searchResetKey}
        ref={searchSelectRef}
        className='coin-search-select'
        popupClassName='coin-search-dropdown'
        open={isSelectOpen}
        placeholder='Search assets, markets, tokens...'
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
        <span className='shortcut-hint'>/</span>

        <Badge count={3} size='small' offset={[-3, 4]}>
          <Button
            className='header-icon-button'
            icon={<BellOutlined />}
            type='text'
            aria-label='Notifications'
          />
        </Badge>

        <div className='header-user-chip'>
          <Avatar className='header-user-avatar'>M</Avatar>
          <span>
            <strong>Max</strong>
            <small>Pro Plan</small>
          </span>
        </div>

        <Button
          className='add-coin-button'
          icon={<PlusOutlined />}
          type='primary'
          onClick={onOpenDrawer}
        >
          Add Asset
        </Button>
      </Flex>

      <Drawer
        className='add-coin-drawer'
        rootClassName='add-coin-drawer-root'
        title={addAssetDrawerTitle}
        width={560}
        open={isDrawerOpen}
        closeIcon={<CloseOutlined />}
        destroyOnClose
        getContainer={getOverlayContainer}
        rootStyle={{ position: 'fixed', inset: 0 }}
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
            <Typography.Text strong>Asset added</Typography.Text>
            <Typography.Text type='secondary'>
              {successNotice.coin.name} is now included in your portfolio.
            </Typography.Text>
          </Space>

          <Button
            className='app-success-toast-close'
            icon={<CloseOutlined />}
            type='text'
            aria-label='Close notification'
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
        getContainer={() => document.querySelector('.app-shell') ?? document.body}
        afterClose={() => setCoin(null)}
        onCancel={() => {
          clearGlobalSearch()
          setIsModalOpen(false)
        }}
      >
        <CoinInfoModal coin={coin} />
      </Modal>
    </Layout.Header>
  )
}
