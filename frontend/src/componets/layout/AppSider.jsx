import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  HomeOutlined,
  MenuOutlined,
  SettingOutlined,
  StarOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { Avatar, Card, Flex, Layout, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { useCrypto } from '../../context/CryptoContext'
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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
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

export default function AppSider() {
  const { userPortfolio, marketCoins } = useCrypto()
  const [isResponsiveSider, setIsResponsiveSider] = useState(
    isResponsiveSiderViewport
  )
  const [isMobileSider, setIsMobileSider] = useState(isMobileSiderViewport)
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(
    isResponsiveSiderViewport
  )

  useEffect(() => {
    const responsiveMediaQuery = window.matchMedia(RESPONSIVE_SIDER_QUERY)
    const mobileMediaQuery = window.matchMedia(MOBILE_SIDER_QUERY)

    function syncSiderState() {
      const isResponsive = responsiveMediaQuery.matches
      const isMobile = mobileMediaQuery.matches

      setIsResponsiveSider(isResponsive)
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

  function handleNavigationClick() {
    if (isMobileSider) {
      setIsSiderCollapsed(true)
    }
  }

  return (
    <>
      {isMobileSider && isSiderCollapsed && (
        <button
          className='portfolio-mobile-menu-trigger'
          type='button'
          aria-label='Open menu'
          onClick={() => setIsSiderCollapsed(false)}
        >
          <span className='mobile-menu-brand-mark' aria-hidden='true'>
            <span className='brand-mark-core' />
          </span>
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
        collapsed={isResponsiveSider ? isSiderCollapsed : false}
        collapsedWidth={isMobileSider ? 0 : 72}
        trigger={null}
      >
      <BrandLockup className='sidebar-brand' />

      <Typography.Title className='sider-title' level={4}>
        Активы портфеля
      </Typography.Title>

      <Typography.Text className='sider-subtitle'>
        Быстрый обзор монет и результата
      </Typography.Text>

      <Space className='sider-navigation' direction='vertical' size={8}>
        {navigationItems.map((navigationItem) => (
          <Flex
            className={
              navigationItem.isActive
                ? 'sider-navigation-item is-active'
                : 'sider-navigation-item'
            }
            align='center'
            gap={10}
            key={navigationItem.label}
            onClick={handleNavigationClick}
          >
            {navigationItem.icon}
            <Typography.Text>{navigationItem.label}</Typography.Text>
          </Flex>
        ))}
      </Space>

      <Space className='sider-coin-list' direction='vertical' size={12}>
        {userPortfolio.map((portfolioCoin) => {
          const marketCoin = marketCoins.find(
            (coin) => coin.id === portfolioCoin.id
          )

          return (
            <Card
              className='dashboard-card portfolio-coin-card'
              key={portfolioCoin.id}
            >
              <Flex justify='space-between' align='flex-start' gap={16}>
                <Space align='start'>
                  <Avatar
                    src={marketCoin?.icon}
                    alt={portfolioCoin.name}
                    size={42}
                  >
                    {marketCoin?.symbol}
                  </Avatar>

                  <Space direction='vertical' size={2}>
                    <Typography.Text strong>
                      {portfolioCoin.name}
                    </Typography.Text>

                    <Typography.Text type='secondary'>
                      {marketCoin?.symbol}
                    </Typography.Text>
                  </Space>
                </Space>

                <Tag color={portfolioCoin.grow ? 'green' : 'red'}>
                  {portfolioCoin.grow ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {portfolioCoin.growPercent}%
                </Tag>
              </Flex>

              <Flex
                justify='space-between'
                align='flex-end'
                style={{ marginTop: 16 }}
              >
                <Space direction='vertical' size={0}>
                  <Typography.Text type='secondary'>
                    Стоимость
                  </Typography.Text>

                  <Typography.Text strong>
                    {formatCurrency(portfolioCoin.totalAmount)}
                  </Typography.Text>
                </Space>

                <Space direction='vertical' size={0} align='end'>
                  <Typography.Text type='secondary'>
                    Результат
                  </Typography.Text>

                  <Typography.Text
                    type={getProfitType(portfolioCoin.totalProfit)}
                    strong
                  >
                    {formatCurrency(portfolioCoin.totalProfit)}
                  </Typography.Text>
                </Space>
              </Flex>
            </Card>
          )
        })}
      </Space>
      </Layout.Sider>
    </>
  )
}
