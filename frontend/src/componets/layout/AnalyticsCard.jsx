import { Typography } from 'antd'

export default function AnalyticsCard({
  detail,
  icon,
  status = 'neutral',
  title,
  value,
}) {
  return (
    <div className='analytics-card'>
      <span className={`analytics-card-icon is-${status}`}>{icon}</span>

      <div className='analytics-card-copy'>
        <Typography.Text className='analytics-card-label'>{title}</Typography.Text>
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
      </div>
    </div>
  )
}
