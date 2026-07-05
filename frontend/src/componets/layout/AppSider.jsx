import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  HomeOutlined,
  SettingOutlined,
  StarOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { Avatar, Card, Flex, Layout, Space, Tag, Typography } from 'antd'

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

export default function AppSider() {
  const { userPortfolio, marketCoins } = useCrypto()

  return (
    <Layout.Sider
      className='portfolio-sider'
      width={276}
      breakpoint='xl'
      collapsedWidth={0}
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
  )
}
