import { useState } from 'react'

import { CheckOutlined } from '@ant-design/icons'
import { Popover } from 'antd'

import BrandMark, {
  BRAND_VARIANTS,
  DEFAULT_BRAND_VARIANT,
} from './BrandMarks'

export default function BrandLockup({
  className = '',
  reviewable = true,
  variant: controlledVariant,
}) {
  const [selectedVariant, setSelectedVariant] = useState(DEFAULT_BRAND_VARIANT)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const activeVariant = controlledVariant ?? selectedVariant

  const lockup = (
    <button
      className={`brand-lockup ${className}`.trim()}
      type='button'
      aria-label={
        reviewable
          ? 'Криптопортфель — открыть варианты логотипа'
          : 'Криптопортфель'
      }
    >
      <BrandMark variant={activeVariant} />

      <span className='brand-copy'>
        <span className='brand-wordmark'>Криптопортфель</span>
        <span className='brand-submark'>портфель и рынки</span>
      </span>
    </button>
  )

  if (!reviewable) {
    return lockup
  }

  const previewPanel = (
    <div className='brand-preview-panel'>
      <div className='brand-preview-heading'>
        <strong>Варианты бренда</strong>
        <span>Нажмите, чтобы применить в шапке</span>
      </div>

      <div className='brand-preview-list'>
        {BRAND_VARIANTS.map((variant) => (
          <button
            className={
              variant.key === activeVariant
                ? 'brand-preview-option is-active'
                : 'brand-preview-option'
            }
            key={variant.key}
            type='button'
            aria-pressed={variant.key === activeVariant}
            onClick={() => {
              setSelectedVariant(variant.key)
              setIsPreviewOpen(false)
            }}
          >
            <BrandMark decorative={false} variant={variant.key} />
            <span className='brand-preview-copy'>
              <strong>{variant.label}</strong>
              <small>{variant.description}</small>
            </span>
            {variant.key === activeVariant && <CheckOutlined />}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Popover
      arrow={false}
      content={previewPanel}
      open={isPreviewOpen}
      overlayClassName='brand-preview-popover'
      placement='bottomLeft'
      trigger='click'
      onOpenChange={setIsPreviewOpen}
    >
      {lockup}
    </Popover>
  )
}
