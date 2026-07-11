export default function BrandLockup({ className = '' }) {
  return (
    <div className={`brand-lockup ${className}`.trim()}>
      <span className='brand-mark' aria-hidden='true'>
        <svg viewBox='0 0 44 44' focusable='false'>
          <defs>
            <linearGradient id='brand-mark-gradient' x1='7' x2='37' y1='6' y2='38'>
              <stop offset='0' stopColor='#6d9ee8' />
              <stop offset='0.52' stopColor='#5b82d6' />
              <stop offset='1' stopColor='#8292b8' />
            </linearGradient>
          </defs>
          <path
            className='brand-mark-shell'
            fill='url(#brand-mark-gradient)'
            d='M22 4 37.6 13v18L22 40 6.4 31V13L22 4Z'
          />
          <path
            className='brand-mark-line'
            d='M14 15.8 22 11l8 4.8v9.4L22 30l-8-4.8v-9.4Z'
          />
          <path className='brand-mark-signal' d='M15 29.5 22 22l7 7.5' />
          <path className='brand-mark-signal' d='M22 22V11' />
          <circle className='brand-mark-core' cx='22' cy='22' r='3.4' />
        </svg>
      </span>

      <span className='brand-copy'>
        <span className='brand-wordmark'>Криптопортфель</span>
        <span className='brand-submark'>портфель и рынки</span>
      </span>
    </div>
  )
}
