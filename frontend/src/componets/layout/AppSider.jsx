import {
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Card,
  Flex,
  Layout,
  Space,
  Tag,
  Typography,
} from 'antd'

import { useCrypto } from '../../context/CryptoContext'

const siderStyle = {
  padding: '24px 16px',
  background: '#0f172a',
  borderRight: '1px solid #1e293b',
}

const titleStyle = {
  color: '#f8fafc',
  marginBottom: 16,
}

const cardStyle = {
  marginBottom: 12,
  background: '#111c2e',
  border: '1px solid #1e293b',
}

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
      width={320}
      breakpoint='xl'
      collapsedWidth={0}
      style={siderStyle}
    >
      <Typography.Title level={4} style={titleStyle}>
        Активы портфеля
      </Typography.Title>

      <Typography.Text className='sider-subtitle'>
        Быстрый обзор монет и результата
      </Typography.Text>

      {userPortfolio.map((portfolioCoin) => {
        const marketCoin = marketCoins.find(
          (coin) => coin.id === portfolioCoin.id
        )

        return (
          <Card
            className='dashboard-card portfolio-coin-card'
            key={portfolioCoin.id}
            style={cardStyle}
          >
            <Flex justify='space-between' align='flex-start' gap={16}>
              <Space align='start'>
                <Avatar
                  src={marketCoin?.icon}
                  alt={portfolioCoin.name}
                  size={40}
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
    </Layout.Sider>
  )
}
