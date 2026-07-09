import { useEffect, useRef, useState } from 'react'

import {
  BellOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Flex,
  Layout,
  Modal,
  Popover,
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMockSignedIn, setIsMockSignedIn] = useState(true)

  const notifications = [
    {
      title: 'BTC выше целевого уровня',
      detail: 'Цена Bitcoin обновила локальный максимум в демо-ленте.',
    },
    {
      title: 'Портфель пересчитан',
      detail: 'Доходность и аллокация обновлены после последних операций.',
    },
    {
      title: 'Риск в норме',
      detail: 'Концентрация крупнейшей позиции остается в рабочем диапазоне.',
    },
  ]

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
    setIsNotificationsOpen(false)
    setIsAccountOpen(false)
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
        <PlusOutlined />
      </span>

      <Space direction='vertical' size={1}>
        <Typography.Text strong>Добавить актив</Typography.Text>
        <Typography.Text type='secondary'>
          Запишите новую покупку в портфель
        </Typography.Text>
      </Space>
    </Flex>
  )

  const notificationsPanel = (
    <div className='header-popover-panel notifications-panel'>
      <div className='header-popover-title'>
        <Typography.Text strong>Уведомления</Typography.Text>
        <span>{notifications.length}</span>
      </div>

      <div className='notification-list'>
        {notifications.map((notification) => (
          <div className='notification-row' key={notification.title}>
            <span className='notification-dot' aria-hidden='true' />
            <div>
              <Typography.Text strong>{notification.title}</Typography.Text>
              <Typography.Text type='secondary'>
                {notification.detail}
              </Typography.Text>
            </div>
          </div>
        ))}
      </div>

      <Button
        block
        type='text'
        onClick={() => setIsNotificationsOpen(false)}
      >
        Закрыть
      </Button>
    </div>
  )

  const accountPanel = (
    <div className='header-popover-panel account-panel'>
      <div className='account-panel-head'>
        <Avatar className='header-user-avatar'>
          {isMockSignedIn ? 'M' : <UserOutlined />}
        </Avatar>
        <div>
          <Typography.Text strong>
            {isMockSignedIn ? 'Макс' : 'Гость'}
          </Typography.Text>
          <Typography.Text type='secondary'>
            {isMockSignedIn ? 'Демо-аккаунт Pro' : 'Демо-вход выключен'}
          </Typography.Text>
        </div>
      </div>

      <div className='account-panel-meta'>
        <span>Статус</span>
        <strong>{isMockSignedIn ? 'Активен' : 'Гость'}</strong>
      </div>

      <Button
        block
        icon={isMockSignedIn ? <LogoutOutlined /> : <LoginOutlined />}
        type={isMockSignedIn ? 'default' : 'primary'}
        onClick={() => {
          setIsMockSignedIn((currentValue) => !currentValue)
          setIsAccountOpen(false)
        }}
      >
        {isMockSignedIn ? 'Выйти из демо' : 'Войти в демо'}
      </Button>
    </div>
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
        <span className='shortcut-hint'>/</span>

        <Popover
          arrow={false}
          content={notificationsPanel}
          open={isNotificationsOpen}
          overlayClassName='header-popover'
          placement='bottomRight'
          trigger='click'
          onOpenChange={(open) => {
            setIsNotificationsOpen(open)
            if (open) {
              setIsAccountOpen(false)
            }
          }}
        >
          <Badge count={notifications.length} size='small' offset={[-3, 4]}>
            <Button
              className='header-icon-button'
              icon={<BellOutlined />}
              type='text'
              aria-label='Уведомления'
              aria-expanded={isNotificationsOpen}
            />
          </Badge>
        </Popover>

        <Popover
          arrow={false}
          content={accountPanel}
          open={isAccountOpen}
          overlayClassName='header-popover'
          placement='bottomRight'
          trigger='click'
          onOpenChange={(open) => {
            setIsAccountOpen(open)
            if (open) {
              setIsNotificationsOpen(false)
            }
          }}
        >
          <button
            className='header-user-chip'
            type='button'
            aria-label='Открыть меню аккаунта'
            aria-expanded={isAccountOpen}
          >
            <Avatar className='header-user-avatar'>
              {isMockSignedIn ? 'M' : <UserOutlined />}
            </Avatar>
            <span>
              <strong>{isMockSignedIn ? 'Макс' : 'Гость'}</strong>
              <small>{isMockSignedIn ? 'Демо Pro' : 'Войти'}</small>
            </span>
          </button>
        </Popover>

        <Button
          className='add-coin-button'
          icon={<PlusOutlined />}
          type='primary'
          onClick={handleOpenDrawer}
        >
          Добавить актив
        </Button>
      </Flex>

      <Button
        className='mobile-add-coin-button'
        icon={<PlusOutlined />}
        type='primary'
        aria-label='Добавить актив'
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
    </Layout.Header>
  )
}
