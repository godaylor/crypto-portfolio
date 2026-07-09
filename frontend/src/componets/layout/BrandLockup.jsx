import { Typography } from 'antd'

export default function BrandLockup({ className = '' }) {
  return (
    <div className={`brand-lockup ${className}`.trim()}>
      <span className='brand-mark' aria-hidden='true'>
        <span className='brand-mark-core' />
      </span>

      <span className='brand-copy'>
        <Typography.Text className='brand-wordmark' strong>
          Crypto
        </Typography.Text>
        <Typography.Text className='brand-submark'>Portfolio</Typography.Text>
      </span>
    </div>
  )
}
