import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { Layout, Card, Statistic, List, Typography, Tag } from 'antd'
import { useContext } from 'react'
import CryptoContext from '../../context/CryptoContext'

const siderStyle = {
  padding: '1rem',
}

const cardStyle = {
  marginBottom: '1rem',
  minWidth: '280px',
}

export default function AppSider() {
  const { assets } = useContext(CryptoContext)

  return (
    <Layout.Sider width='25%' style={siderStyle}>
      {assets.map((asset) => (
        <Card key={asset.id} style={cardStyle}>
          <Statistic
            title={asset.id.charAt(0).toUpperCase() + asset.id.slice(1)}
            value={asset.totalAmount}
            precision={2}
            valueStyle={{ color: asset.grow ? '#3f8600' : '#cf1322' }}
            prefix={asset.grow ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix='$'
          />
          <List
            size='small'
            dataSource={[
              {
                title: 'Total Profit',
                value: asset.totalProfit,
                withTag: true,
              },
              { title: 'Asser Amount', value: asset.amount, isPlain: true },
              // { title: "Difference", value: asset.growPercent },
              // { title: "Grow", value: asset.grow },
              // { title: "Grow Percent", value: asset.growPercent },
              // { title: "Total Amount", value: asset.totalAmount },
            ]}
            renderItem={(item) => (
              <List.Item style={{ flexWrap: 'nowrap' }}>
                <span style={{ marginRight: '1.5rem', whiteSpace: 'nowrap' }}>
                  {item.title}
                </span>
                <span style={{ display: 'flex' }}>
                  {item.withTag && (
                    <Tag style={{}} color={asset.grow ? 'green' : 'red'}>
                      {asset.growPercent}%
                    </Tag>
                  )}
                  {item.isPlain && Number(item.value)}
                  {!item.isPlain && (
                    <Typography.Text
                      style={{ wordBreak: 'normal' }}
                      type={
                        asset.totalProfit > 0
                          ? 'success'
                          : asset.totalProfit < 0
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {Number(item.value).toFixed(2)}
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
