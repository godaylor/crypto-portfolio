import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  CloseOutlined,
  HomeOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  StarOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Flex, Layout, Space, Tag, Tooltip, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useCrypto } from '../../context/CryptoContext'
import ThemeSwitcher from '../ThemeSwitcher'
import BrandLockup from './BrandLockup'

const navigationItems = [
  {
    label: 'Обзор',
    icon: <HomeOutlined />,
    isActive: true,
  },
  {
    label: 'Избранное',
    icon: <StarOutlined />,
  },
  {
    label: 'Рынки',
    icon: <BarChartOutlined />,
  },
  {
    label: 'Транзакции',
    icon: <SwapOutlined />,
  },
  {
    label: 'Аналитика',
    icon: <LineChartOutlined />,
  },
  {
    label: 'Настройки',
    icon: <SettingOutlined />,
  },
]

function getProfitType(value) {
  if (value > 0) {
    return 'success'
  }

  if (value < 0) {
    return 'danger'
  }

  return 'warning'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value)
}

const RESPONSIVE_SIDER_QUERY = '(max-width: 1439px)'
const MOBILE_SIDER_QUERY = '(max-width: 920px)'

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

export default function AppSider({ themeName, setThemeName }) {
  const { userPortfolio, marketCoins } = useCrypto()
  const scrollRegionRef = useRef(null)
  const [isMobileSider, setIsMobileSider] = useState(isMobileSiderViewport)
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(
    isResponsiveSiderViewport
  )

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

  function handleNavigationClick() {
    if (isMobileSider) {
      setIsSiderCollapsed(true)
    }
  }

  function handleSiderToggle() {
    setIsSiderCollapsed((currentValue) => !currentValue)
  }

  const toggleIcon = isMobileSider ? (
    <CloseOutlined />
  ) : isSiderCollapsed ? (
    <MenuUnfoldOutlined />
  ) : (
    <MenuFoldOutlined />
  )

  return (
    <>
      {isMobileSider && isSiderCollapsed && (
        <button
          className='portfolio-mobile-menu-trigger'
          type='button'
          aria-label='Open menu'
          onClick={() => setIsSiderCollapsed(false)}
        >
          <MenuOutlined />
        </button>
      )}

      {isMobileSider && !isSiderCollapsed && (
        <button
          className='portfolio-sider-backdrop'
          type='button'
          aria-label='Close menu'
          onClick={() => setIsSiderCollapsed(true)}
        />
      )}

      <Layout.Sider
        className={
          isMobileSider ? 'portfolio-sider is-mobile-drawer' : 'portfolio-sider'
        }
        width={276}
        collapsed={isSiderCollapsed}
        collapsedWidth={isMobileSider ? 0 : 72}
        trigger={null}
      >
        <div className='sider-topbar'>
          <BrandLockup className='sidebar-brand' />

          <button
            className='portfolio-sider-toggle'
            type='button'
            aria-label={isSiderCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isSiderCollapsed}
            onClick={handleSiderToggle}
          >
            {toggleIcon}
          </button>
        </div>

        <div className='sider-scroll-region' ref={scrollRegionRef}>
          <div className='portfolio-sider-summary'>
            <Typography.Text>Общая стоимость</Typography.Text>
            <Typography.Title level={4}>
              {formatCurrency(portfolioBalance)}
            </Typography.Title>
            <Tag color={getProfitType(portfolioProfit)}>
              {portfolioProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
              {formatPercent(portfolioProfitPercent)}%
            </Tag>
          </div>

          <Space className='sider-navigation' direction='vertical' size={8}>
            {navigationItems.map((navigationItem) => {
              const navigationNode = (
                <Flex
                  className={
                    navigationItem.isActive
                      ? 'sider-navigation-item is-active'
                      : 'sider-navigation-item'
                  }
                  align='center'
                  gap={10}
                  onClick={handleNavigationClick}
                >
                  {navigationItem.icon}
                  <Typography.Text>{navigationItem.label}</Typography.Text>
                </Flex>
              )

              if (isSiderCollapsed && !isMobileSider) {
                return (
                  <Tooltip
                    key={navigationItem.label}
                    placement='right'
                    title={navigationItem.label}
                  >
                    {navigationNode}
                  </Tooltip>
                )
              }

              return <div key={navigationItem.label}>{navigationNode}</div>
            })}
          </Space>

          <div className='sider-section-heading'>
            <Typography.Text>Портфель</Typography.Text>
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
                    {formatPercent(portfolioCoin.growPercent).replace('+', '')}%
                  </span>
                </div>
              </div>
            ))}
          </Space>
        </div>

        <div className='sider-bottom-area'>
          <div className='sider-profile-card'>
            <Avatar className='sider-profile-avatar'>M</Avatar>
            <div className='sider-profile-copy'>
              <Typography.Text strong>Максим</Typography.Text>
              <Typography.Text>max@example.com</Typography.Text>
              <span className='sider-profile-status'>
                <span aria-hidden='true' />
                Live demo
              </span>
            </div>
          </div>

          <div className='sider-bottom-actions'>
            <ThemeSwitcher
              className='sider-theme-switcher'
              themeName={themeName}
              setThemeName={setThemeName}
              placement='topRight'
              variant='sidebar'
            />

            <Button
              className='sider-settings-button'
              icon={<SettingOutlined />}
              type='text'
              aria-label='Settings'
            />
          </div>
        </div>
      </Layout.Sider>
    </>
  )
}
