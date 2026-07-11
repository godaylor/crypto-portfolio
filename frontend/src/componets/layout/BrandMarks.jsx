export const BRAND_VARIANTS = [
  {
    key: 'geometric',
    label: 'Geometric Fintech',
    description: 'Геометрия активов и распределения портфеля',
  },
  {
    key: 'liquid',
    label: 'Glass / Liquid',
    description: 'Мягкая глубина для glass-тем',
  },
  {
    key: 'monogram',
    label: 'Монограмма КП',
    description: 'Компактный символ для малого размера',
  },
]

export const DEFAULT_BRAND_VARIANT = 'geometric'

function GeometricFintechMark() {
  return (
    <svg className='brand-mark-svg' viewBox='0 0 44 44' focusable='false'>
      <path
        className='brand-geo-frame'
        d='M22 4.8 37.8 13.6v16.8L22 39.2 6.2 30.4V13.6L22 4.8Z'
      />
      <path
        className='brand-geo-segment brand-geo-segment-primary'
        d='M22 8.7v13.2L10.3 15.2 22 8.7Z'
      />
      <path
        className='brand-geo-segment brand-geo-segment-secondary'
        d='m22 21.9 11.7-6.7v12.9L22 34.7V21.9Z'
      />
      <path
        className='brand-geo-segment brand-geo-segment-tertiary'
        d='M22 21.9v12.8l-11.7-6.6V15.2L22 21.9Z'
      />
      <circle className='brand-geo-core' cx='22' cy='21.9' r='2.65' />
    </svg>
  )
}

function GlassLiquidMark() {
  return (
    <svg className='brand-mark-svg' viewBox='0 0 44 44' focusable='false'>
      <rect className='brand-liquid-surface' x='5' y='5' width='34' height='34' rx='12' />
      <path
        className='brand-liquid-blob brand-liquid-blob-primary'
        d='M11.2 17.2c1.8-6.3 9.7-9.8 15.7-7 6.5 3 9 11.2 5.2 17.1-3.7 5.8-12 8-17.2 3.6-3.9-3.2-5-8.9-3.7-13.7Z'
      />
      <path
        className='brand-liquid-blob brand-liquid-blob-secondary'
        d='M15.2 27.1c3.5-5.2 8.8-8.6 16.9-9.6 2.2 5.5.4 12.4-5 15.8-4.5 2.9-9.2 1.2-11.9-6.2Z'
      />
      <path className='brand-liquid-highlight' d='M12.8 18.5c1.1-4.2 4.3-7.1 8.4-7.8' />
      <path className='brand-liquid-orbit' d='M12.2 27.8c5.9 4.8 14.7 4.2 19.6-1.7' />
      <circle className='brand-liquid-core' cx='28.8' cy='16.1' r='2.4' />
    </svg>
  )
}

function MinimalMonogramMark() {
  return (
    <svg className='brand-mark-svg' viewBox='0 0 44 44' focusable='false'>
      <rect className='brand-mono-surface' x='5' y='5' width='34' height='34' rx='10.5' />
      <path className='brand-mono-letter' d='M12.5 11.5v21M12.5 22l8.2-10.5M12.5 22l8.6 10.5' />
      <path className='brand-mono-letter' d='M24.5 32.5v-21h8v21M24.5 11.5h8' />
      <path className='brand-mono-accent' d='m24.5 27 4-4 4 4' />
    </svg>
  )
}

const markComponents = {
  geometric: GeometricFintechMark,
  liquid: GlassLiquidMark,
  monogram: MinimalMonogramMark,
}

export default function BrandMark({
  className = '',
  decorative = true,
  variant = DEFAULT_BRAND_VARIANT,
}) {
  const MarkComponent = markComponents[variant] ?? markComponents[DEFAULT_BRAND_VARIANT]

  return (
    <span
      className={`brand-mark ${className}`.trim()}
      data-brand-variant={variant}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'Логотип Криптопортфель'}
      role={decorative ? undefined : 'img'}
    >
      <MarkComponent />
    </span>
  )
}
