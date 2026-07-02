import { useContext } from 'react'

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Layout, List, Statistic, Tag, Typography } from 'antd'

import CryptoContext from '../../context/CryptoContext'

const siderStyle = {
  padding: '1rem',
}

const cardStyle = {
  marginBottom: '1rem',
  minWidth: '280px',
}

export default function AppSider() {
  const { userPortfolio } = useContext(CryptoContext)

  return (
    <Layout.Sider width='25%' style={siderStyle}>
      {/* Отображаем информацию по каждой монете портфеля */}
      {userPortfolio.map((portfolioCoin) => (
        <Card key={portfolioCoin.id} style={cardStyle}>
          <Statistic
            title={
              portfolioCoin.id.charAt(0).toUpperCase() +
              portfolioCoin.id.slice(1)
            }
            value={portfolioCoin.totalAmount}
            precision={2}
            valueStyle={{
              color: portfolioCoin.grow ? '#3f8600' : '#cf1322',
            }}
            prefix={
              portfolioCoin.grow
                ? <ArrowUpOutlined />
                : <ArrowDownOutlined />
            }
            suffix='$'
          />

          <List
            size='small'
            // Данные, которые отображаются
            // внутри карточки монеты.
            dataSource={[
              {
                title: 'Total Profit',
                value: portfolioCoin.totalProfit,
                withTag: true,
              },
              {
                title: 'Coin Amount',
                value: portfolioCoin.amount,
                isPlain: true,
              },
            ]}
            renderItem={(infoItem) => (
              <List.Item style={{ flexWrap: 'nowrap' }}>
                <span
                  style={{
                    marginRight: '1.5rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {infoItem.title}
                </span>

                <span style={{ display: 'flex' }}>
                  {infoItem.withTag && (
                    <Tag
                      color={portfolioCoin.grow ? 'green' : 'red'}
                    >
                      {portfolioCoin.growPercent}%
                    </Tag>
                  )}

                  {infoItem.isPlain && Number(infoItem.value)}

                  {!infoItem.isPlain && (
                    <Typography.Text
                      // Цвет зависит от прибыли
                      // или убытка.
                      type={
                        portfolioCoin.totalProfit > 0
                          ? 'success'
                          : portfolioCoin.totalProfit < 0
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {Number(infoItem.value).toFixed(2)}
                    </Typography.Text>
                  )}
                </span>
              </List.Item>
            )}
          />
        </Card>
      ))}
    </Layout.Sider>
  )
}