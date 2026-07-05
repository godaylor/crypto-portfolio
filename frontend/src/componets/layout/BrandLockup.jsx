import { Typography } from 'antd'

export default function BrandLockup({ className = '' }) {
  return (
    <div className={`brand-lockup ${className}`.trim()}>
      <span className='brand-mark' aria-hidden='true'>
        <span className='brand-mark-core' />
      </span>

      <Typography.Text className='brand-wordmark' strong>
        Crypto Portfolio
      </Typography.Text>
    </div>
  )
}
