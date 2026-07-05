import { Card, Space, Typography } from 'antd'

export default function AnalyticsCard({
  detail,
  icon,
  status = 'neutral',
  title,
  value,
}) {
  return (
    <Card className='dashboard-card analytics-card' size='small'>
      <Space className='analytics-card-content' align='start' size={12}>
        <span className={`analytics-card-icon is-${status}`}>{icon}</span>

        <Space direction='vertical' size={3}>
          <Typography.Text className='analytics-card-label'>
            {title}
          </Typography.Text>

          <Typography.Title
            className={`analytics-card-value is-${status}`}
            level={5}
          >
            {value}
          </Typography.Title>

          {detail && (
            <Typography.Text className='analytics-card-detail'>
              {detail}
            </Typography.Text>
          )}
        </Space>
      </Space>
    </Card>
  )
}
