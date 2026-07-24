import {
  BarChartOutlined,
  CloseOutlined,
  HomeOutlined,
  LineChartOutlined,
  MenuOutlined,
  SettingOutlined,
  SwapOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Avatar, Flex, Layout, Space, Tooltip, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useCrypto } from '../../context/CryptoContext'
import ThemeSwitcher from '../ThemeSwitcher'

const navigationItems = [
  {
    key: 'dashboard',
    label: 'Обзор',
    icon: <HomeOutlined />,
  },
  {
    key: 'assets',
    label: 'Активы',
    icon: <WalletOutlined />,
  },
  {
    key: 'analytics',
    label: 'Аналитика',
    icon: <LineChartOutlined />,
  },
  {
    key: 'markets',
    label: 'Рынки',
    icon: <BarChartOutlined />,
  },
  {
    key: 'transactions',
    label: 'Операции',
    icon: <SwapOutlined />,
  },
  {
    key: 'settings',
    label: 'Настройки',
    icon: <SettingOutlined />,
  },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value)
}

const RESPONSIVE_SIDER_QUERY = '(max-width: 1320px)'
const MOBILE_SIDER_QUERY = '(max-width: 720px)'

function isResponsiveSiderViewport() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(RESPONSIVE_SIDER_QUERY).matches
  )
}

function isMobileSiderViewport() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(MOBILE_SIDER_QUERY).matches
  )
}

export default function AppSider({
  currentSection,
  onNavigate,
  setThemeName,
  shellVariant = 'default',
  themeName,
}) {
  const { userPortfolio, marketCoins } = useCrypto()
  const scrollRegionRef = useRef(null)
  const [isMobileSider, setIsMobileSider] = useState(isMobileSiderViewport)
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(
    isResponsiveSiderViewport
  )
  const isFlagshipShell = shellVariant === 'flagship'

  const portfolioBalance = useMemo(
    () =>
      userPortfolio.reduce(
        (totalBalance, portfolioCoin) =>
          totalBalance + portfolioCoin.totalAmount,
        0
      ),
    [userPortfolio]
  )

  const portfolioProfit = useMemo(
    () =>
      userPortfolio.reduce(
        (totalProfit, portfolioCoin) => totalProfit + portfolioCoin.totalProfit,
        0
      ),
    [userPortfolio]
  )

  const portfolioInvested = useMemo(
    () =>
      userPortfolio.reduce(
        (totalInvested, portfolioCoin) =>
          totalInvested + portfolioCoin.amount * portfolioCoin.price,
        0
      ),
    [userPortfolio]
  )

  const portfolioProfitPercent = portfolioInvested
    ? (portfolioProfit / portfolioInvested) * 100
    : 0

  const watchList = useMemo(
    () =>
      [...userPortfolio]
        .sort(
          (firstCoin, secondCoin) =>
            secondCoin.totalAmount - firstCoin.totalAmount
        )
        .slice(0, 5)
        .map((portfolioCoin) => {
          const marketCoin = marketCoins.find(
            (coin) => coin.id === portfolioCoin.id
          )

          return {
            ...portfolioCoin,
            icon: marketCoin?.icon,
            symbol: marketCoin?.symbol,
          }
        }),
    [marketCoins, userPortfolio]
  )

  useEffect(() => {
    const responsiveMediaQuery = window.matchMedia(RESPONSIVE_SIDER_QUERY)
    const mobileMediaQuery = window.matchMedia(MOBILE_SIDER_QUERY)

    function syncSiderState() {
      const isResponsive = responsiveMediaQuery.matches
      const isMobile = mobileMediaQuery.matches

      setIsMobileSider(isMobile)
      setIsSiderCollapsed(isResponsive)
    }

    syncSiderState()
    responsiveMediaQuery.addEventListener('change', syncSiderState)
    mobileMediaQuery.addEventListener('change', syncSiderState)

    return () => {
      responsiveMediaQuery.removeEventListener('change', syncSiderState)
      mobileMediaQuery.removeEventListener('change', syncSiderState)
    }
  }, [])

  useEffect(() => {
    if (isMobileSider && !isSiderCollapsed) {
      scrollRegionRef.current?.scrollTo({ top: 0 })
    }
  }, [isMobileSider, isSiderCollapsed])

  useEffect(() => {
    const shouldLockScroll = isMobileSider && !isSiderCollapsed

    document.body.classList.toggle('is-mobile-drawer-open', shouldLockScroll)

    return () => {
      document.body.classList.remove('is-mobile-drawer-open')
    }
  }, [isMobileSider, isSiderCollapsed])

  function handleNavigationClick(sectionKey) {
    onNavigate(sectionKey)

    if (isMobileSider) {
      setIsSiderCollapsed(true)
    }
  }

  function handleSiderToggle() {
    setIsSiderCollapsed((currentValue) => !currentValue)
  }

  const toggleIcon = isMobileSider ? <CloseOutlined /> : <MenuOutlined />

  const profitStatus = portfolioProfit >= 0 ? 'positive' : 'negative'

  return (
    <>
      {isMobileSider && isSiderCollapsed && (
        <button
          className='portfolio-mobile-menu-trigger'
          type='button'
          aria-label='Открыть меню'
          onClick={() => setIsSiderCollapsed(false)}
        >
          <MenuOutlined />
        </button>
      )}

      {isMobileSider && !isSiderCollapsed && (
        <button
          className='portfolio-sider-backdrop'
          type='button'
          aria-label='Закрыть меню'
          onClick={() => setIsSiderCollapsed(true)}
        />
      )}

      <Layout.Sider
        className={
          isMobileSider ? 'portfolio-sider is-mobile-drawer' : 'portfolio-sider'
        }
        width={isFlagshipShell ? 224 : 264}
        collapsed={isSiderCollapsed}
        collapsedWidth={isMobileSider ? 0 : 72}
        trigger={null}
      >
        <div className='sider-topbar'>
          <Typography.Text className='sider-menu-label'>
            Навигация
          </Typography.Text>

          <button
            className='portfolio-sider-toggle'
            type='button'
            aria-label={
              isSiderCollapsed ? 'Развернуть меню' : 'Свернуть меню'
            }
            aria-expanded={!isSiderCollapsed}
            onClick={handleSiderToggle}
          >
            {toggleIcon}
          </button>
        </div>

        <div className='sider-scroll-region' ref={scrollRegionRef}>
          <Space className='sider-navigation' direction='vertical' size={8}>
            {navigationItems.map((navigationItem) => {
              const destination =
                isFlagshipShell && navigationItem.key === 'dashboard'
                  ? 'dashboard-v2'
                  : navigationItem.key
              const navigationNode = (
                <button
                  className={
                    destination === currentSection
                      ? 'sider-navigation-item is-active'
                      : 'sider-navigation-item'
                  }
                  type='button'
                  onClick={() => handleNavigationClick(destination)}
                >
                  {navigationItem.icon}
                  <Typography.Text>{navigationItem.label}</Typography.Text>
                </button>
              )

              if (isSiderCollapsed && !isMobileSider) {
                return (
                  <Tooltip
                    key={navigationItem.key}
                    placement='right'
                    title={navigationItem.label}
                  >
                    {navigationNode}
                  </Tooltip>
                )
              }

              return <div key={navigationItem.key}>{navigationNode}</div>
            })}
          </Space>

          {isFlagshipShell ? (
            <div className='v2-sider-context'>
              <span>Private wealth</span>
              <strong>Личное пространство</strong>
              <small><i /> Данные синхронизированы</small>
            </div>
          ) : (
            <>
              <div className='portfolio-sider-summary'>
                <Typography.Text>Стоимость портфеля</Typography.Text>
                <Typography.Title level={4}>
                  {formatCurrency(portfolioBalance)}
                </Typography.Title>
                <span className={`status-pill is-${profitStatus}`}>
                  {formatPercent(portfolioProfitPercent)}% доходность
                </span>
              </div>

              <div className='sider-section-heading'>
                <Typography.Text>Крупные позиции</Typography.Text>
                <span>{watchList.length}</span>
              </div>

              <Space className='sider-coin-list' direction='vertical' size={8}>
                {watchList.map((portfolioCoin, index) => (
                  <div
                    className='portfolio-coin-row'
                    key={`${portfolioCoin.id}-${index}`}
                  >
                    <Avatar
                      src={portfolioCoin.icon}
                      alt={portfolioCoin.name}
                      size={30}
                    >
                      {portfolioCoin.symbol}
                    </Avatar>

                    <div className='portfolio-coin-meta'>
                      <Typography.Text>{portfolioCoin.name}</Typography.Text>
                      <Typography.Text>{portfolioCoin.symbol}</Typography.Text>
                    </div>

                    <div className='portfolio-coin-result'>
                      <strong>{formatCurrency(portfolioCoin.totalAmount)}</strong>
                      <span className={portfolioCoin.grow ? 'is-positive' : 'is-negative'}>
                        {portfolioCoin.grow ? '+' : '-'}
                        {portfolioCoin.growPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </Space>
            </>
          )}
        </div>

        <div className='sider-bottom-area'>
          <ThemeSwitcher
            className='sider-theme-switcher'
            themeName={themeName}
            setThemeName={setThemeName}
            placement='topLeft'
            showLabel={!isSiderCollapsed}
          />
        </div>
      </Layout.Sider>
    </>
  )
}
