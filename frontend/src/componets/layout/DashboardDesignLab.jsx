import {
  ArrowRightOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

import { createPortfolioPerformanceDemoSeries } from '../../demo/portfolioPerformanceDemoData'

const CONCEPTS = [
  { key: 'dashboard-aperture', label: 'Aperture', index: '01' },
  { key: 'dashboard-ledger', label: 'Ledger', index: '02' },
  { key: 'dashboard-orbit', label: 'Orbit', index: '03' },
]

const ASSET_COLORS = [
  'var(--lab-accent)',
  'var(--lab-accent-2)',
  'var(--positive)',
  'var(--warning)',
  'var(--text-muted)',
]

function formatCurrency(value, compact = false) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value, signDisplay = 'auto') {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatAmount(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 4,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatReportDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)
}

function valueStatus(value) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function LabBrand({ variant }) {
  return (
    <div className={`lab-brand lab-brand-${variant}`} translate='no'>
      <span className='lab-brand-mark' aria-hidden='true'>
        <svg viewBox='0 0 44 44' focusable='false'>
          <path d='M8 13.5 22 5l14 8.5v17L22 39 8 30.5Z' />
          <path d='m14 17 8-4.7 8 4.7v10l-8 4.7-8-4.7Z' />
          <path d='M22 12.3V22l8 5M22 22l-8 5' />
          <circle cx='22' cy='22' r='2.5' />
        </svg>
      </span>
      <span className='lab-brand-copy'>
        <strong>КРИПТОПОРТФЕЛЬ</strong>
        <small>private digital wealth</small>
      </span>
    </div>
  )
}

function LabNavigation({ activeConcept }) {
  return (
    <nav className='lab-navigation' aria-label='Концепты Design Lab'>
      <a className='lab-back-link' href='#dashboard'>
        Текущий Dashboard
      </a>

      <div className='lab-concept-links'>
        {CONCEPTS.map((concept) => (
          <a
            className={concept.key === activeConcept ? 'is-active' : undefined}
            href={`#${concept.key}`}
            aria-current={concept.key === activeConcept ? 'page' : undefined}
            key={concept.key}
          >
            <span>{concept.index}</span>
            {concept.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

function PerformanceLine({ balance, id, minimal = false }) {
  const series = createPortfolioPerformanceDemoSeries(balance, '30d')
  const values = series.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1
  const points = series.map((point, index) => {
    const x = 6 + (index / (series.length - 1)) * 88
    const y = 88 - ((point.value - minValue) / range) * 68
    return { x, y, ...point }
  })
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = `6,94 ${line} 94,94`

  return (
    <div className={minimal ? 'lab-performance is-minimal' : 'lab-performance'}>
      <svg
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        role='img'
        aria-label='Динамика стоимости портфеля за 30 дней'
      >
        <defs>
          <linearGradient id={`${id}-area`} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--lab-accent)' stopOpacity='.32' />
            <stop offset='100%' stopColor='var(--lab-accent)' stopOpacity='0' />
          </linearGradient>
        </defs>
        {!minimal && <polygon points={area} fill={`url(#${id}-area)`} />}
        <polyline className='lab-performance-line' points={line} />
        <circle
          className='lab-performance-end'
          cx={points.at(-1).x}
          cy={points.at(-1).y}
          r='2'
        />
      </svg>

      {!minimal && (
        <div className='lab-chart-axis' aria-hidden='true'>
          {series.map((point, index) => (
            <span key={point.label}>{index % 2 === 0 ? point.label : ''}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function AssetIcon({ asset, size = 34 }) {
  return (
    <img
      className='lab-asset-icon'
      src={asset.icon}
      alt=''
      width={size}
      height={size}
      loading='lazy'
    />
  )
}

function AllocationRing({ holdings, label }) {
  let cursor = 0
  const segments = holdings.map((asset, index) => {
    const start = cursor
    cursor += asset.allocation
    return `${ASSET_COLORS[index % ASSET_COLORS.length]} ${start}% ${cursor}%`
  })

  return (
    <div
      className='lab-allocation-ring'
      style={{
        '--allocation-ring': segments.length
          ? `conic-gradient(${segments.join(', ')})`
          : 'var(--surface-muted)',
      }}
      role='img'
      aria-label={`Распределение портфеля. Крупнейшая позиция: ${label}`}
    >
      <span>
        <strong>{formatPercent(holdings[0]?.allocation ?? 0)}%</strong>
        <small>{holdings[0]?.symbol ?? '—'}</small>
      </span>
    </div>
  )
}

function ApertureDashboard({ snapshot, userPortfolio }) {
  const status = valueStatus(snapshot.portfolioProfit)

  return (
    <section className='lab-concept lab-aperture' aria-labelledby='aperture-title'>
      <header className='aperture-masthead'>
        <LabBrand variant='aperture' />
        <div>
          <span>Design Lab · 01</span>
          <strong>Aperture</strong>
        </div>
      </header>

      <div className='aperture-stage'>
        <div className='aperture-balance'>
          <span className='lab-overline'>Общая стоимость</span>
          <h1 id='aperture-title'>{formatCurrency(snapshot.portfolioBalance)}</h1>
          <p>
            Капитал в фокусе. <b className={`is-${status}`}>
              {formatCurrency(snapshot.portfolioProfit)}
            </b>{' '}
            за всё время.
          </p>

          <div className='aperture-balance-actions'>
            <a href='#assets'>
              Открыть активы <ArrowRightOutlined aria-hidden='true' />
            </a>
            <span>{userPortfolio.length} позиций · синхронизировано</span>
          </div>
        </div>

        <div className='aperture-orbit' aria-hidden='true'>
          <span className='aperture-orbit-track is-outer' />
          <span className='aperture-orbit-track is-inner' />
          <span className='aperture-orbit-glow' />
          {snapshot.sortedHoldings.slice(0, 4).map((asset, index) => (
            <span className={`aperture-orbit-asset asset-${index + 1}`} key={asset.key}>
              <AssetIcon asset={asset} size={index === 0 ? 52 : 38} />
            </span>
          ))}
        </div>

        <div className='aperture-move'>
          <span>Сегодня</span>
          <strong className={`is-${valueStatus(snapshot.portfolioDailyChange)}`}>
            {formatPercent(snapshot.portfolioDailyChange, 'exceptZero')}%
          </strong>
          <small>{formatCurrency(snapshot.portfolioDailyChangeValue)}</small>
        </div>

        <div className='aperture-chart'>
          <div className='aperture-chart-heading'>
            <span>30 дней</span>
            <strong>Траектория капитала</strong>
          </div>
          <PerformanceLine balance={snapshot.portfolioBalance} id='aperture' />
        </div>
      </div>

      <div className='aperture-lower-grid'>
        <div className='aperture-assets'>
          <div className='lab-section-heading'>
            <span>Состав</span>
            <h2>Ведущие позиции</h2>
            <a href='#assets'>Все активы</a>
          </div>

          <div className='aperture-asset-list'>
            {snapshot.sortedHoldings.slice(0, 4).map((asset, index) => (
              <div className='aperture-asset-row' key={asset.key}>
                <span className='aperture-asset-index'>0{index + 1}</span>
                <AssetIcon asset={asset} />
                <div>
                  <strong>{asset.name}</strong>
                  <span>{formatAmount(asset.amount)} {asset.symbol}</span>
                </div>
                <b>{formatPercent(asset.allocation)}%</b>
                <strong>{formatCurrency(asset.totalAmount)}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className='aperture-intelligence'>
          <span className='lab-overline'>Портфельный сигнал</span>
          <div className='aperture-signal-score'>
            <strong>{100 - snapshot.riskScore}</strong>
            <span>баланс</span>
          </div>
          <h2>Умеренная концентрация</h2>
          <p>
            {snapshot.bestAsset?.name ?? 'Лидер'} задаёт импульс, а стабильная доля
            {` ${formatPercent(snapshot.stableShare)}%`} смягчает волатильность.
          </p>
          <a href='#analytics'>
            Смотреть анализ <ArrowRightOutlined aria-hidden='true' />
          </a>
        </aside>
      </div>
    </section>
  )
}

function LedgerDashboard({ snapshot }) {
  const latestTransaction = snapshot.transactions[0]

  return (
    <section className='lab-concept lab-ledger' aria-labelledby='ledger-title'>
      <header className='ledger-masthead'>
        <LabBrand variant='ledger' />
        <div className='ledger-edition'>
          <span>Персональный отчёт</span>
          <strong>{formatReportDate(new Date(2026, 6, 23))}</strong>
        </div>
      </header>

      <div className='ledger-title-row'>
        <div>
          <span className='lab-overline'>Design Lab · 02 / Editorial wealth</span>
          <h1 id='ledger-title'>Капитал,<br />без рыночного шума.</h1>
        </div>

        <div className='ledger-balance'>
          <span>Стоимость портфеля</span>
          <strong>{formatCurrency(snapshot.portfolioBalance)}</strong>
          <b className={`is-${valueStatus(snapshot.portfolioProfitPercent)}`}>
            {formatPercent(snapshot.portfolioProfitPercent, 'exceptZero')}% с момента входа
          </b>
        </div>
      </div>

      <div className='ledger-tape' aria-label='Ключевые показатели портфеля'>
        <div>
          <span>01 / Изменение 24 ч</span>
          <strong className={`is-${valueStatus(snapshot.portfolioDailyChange)}`}>
            {formatPercent(snapshot.portfolioDailyChange, 'exceptZero')}%
          </strong>
          <small>{formatCurrency(snapshot.portfolioDailyChangeValue)}</small>
        </div>
        <div>
          <span>02 / Накопленный результат</span>
          <strong>{formatCurrency(snapshot.portfolioProfit)}</strong>
          <small>при вложениях {formatCurrency(snapshot.portfolioInvested)}</small>
        </div>
        <div>
          <span>03 / Риск-профиль</span>
          <strong>{snapshot.riskScore}<i>/100</i></strong>
          <small>умеренная концентрация</small>
        </div>
      </div>

      <div className='ledger-grid'>
        <article className='ledger-chart-panel'>
          <div className='ledger-panel-heading'>
            <div>
              <span>Динамика / 30 дней</span>
              <h2>Ритм портфеля</h2>
            </div>
            <b>+3,00%</b>
          </div>
          <PerformanceLine balance={snapshot.portfolioBalance} id='ledger' minimal />
          <div className='ledger-chart-footer'>
            <span>Начало периода</span>
            <span>{formatCurrency(snapshot.portfolioBalance * 0.88)}</span>
            <span>Сейчас</span>
            <strong>{formatCurrency(snapshot.portfolioBalance)}</strong>
          </div>
        </article>

        <aside className='ledger-note'>
          <span>Наблюдение редакции</span>
          <h2>{snapshot.bestAsset?.name ?? 'Лидер портфеля'} — главный источник роста.</h2>
          <p>
            Доля крупнейшей позиции — {formatPercent(snapshot.largestAssetShare)}%.
            Следующий ребаланс стоит начать с проверки этой экспозиции.
          </p>
          <a href='#analytics'>
            Открыть аналитику
          </a>
        </aside>
      </div>

      <div className='ledger-holdings'>
        <div className='ledger-holdings-heading'>
          <div>
            <span>Реестр активов</span>
            <h2>Позиции в портфеле</h2>
          </div>
          <a href='#assets'>Полный реестр</a>
        </div>

        <div className='ledger-table' role='table' aria-label='Позиции в портфеле'>
          <div className='ledger-table-head' role='row'>
            <span role='columnheader'>Актив</span>
            <span role='columnheader'>Доля</span>
            <span role='columnheader'>Результат</span>
            <span role='columnheader'>Стоимость</span>
          </div>
          {snapshot.sortedHoldings.map((asset) => (
            <div className='ledger-table-row' role='row' key={asset.key}>
              <div role='cell'>
                <AssetIcon asset={asset} />
                <span><strong>{asset.name}</strong><small>{asset.symbol}</small></span>
              </div>
              <span role='cell'>{formatPercent(asset.allocation)}%</span>
              <span className={`is-${valueStatus(asset.totalProfit)}`} role='cell'>
                {formatCurrency(asset.totalProfit)}
              </span>
              <strong role='cell'>{formatCurrency(asset.totalAmount)}</strong>
            </div>
          ))}
        </div>

        <footer className='ledger-footer-note'>
          <span>Последняя запись</span>
          <strong>{latestTransaction?.name ?? '—'}</strong>
          <span>{latestTransaction ? formatCurrency(latestTransaction.entryValue) : '—'}</span>
        </footer>
      </div>
    </section>
  )
}

function OrbitMap({ holdings }) {
  const positions = [
    { x: 50, y: 48 },
    { x: 75, y: 26 },
    { x: 79, y: 70 },
    { x: 25, y: 72 },
    { x: 20, y: 29 },
  ]

  return (
    <div className='orbit-map' role='img' aria-label='Карта распределения активов'>
      <svg viewBox='0 0 100 100' aria-hidden='true' focusable='false'>
        <circle cx='50' cy='50' r='34' />
        <circle cx='50' cy='50' r='21' />
        {positions.slice(1).map((position, index) => (
          <line key={`${position.x}-${position.y}`} x1='50' y1='48' x2={position.x} y2={position.y} />
        ))}
      </svg>

      {holdings.slice(0, 5).map((asset, index) => {
        const position = positions[index]
        const size = 48 + Math.min(asset.allocation, 50) * 1.35

        return (
          <div
            className={`orbit-node orbit-node-${index + 1}`}
            style={{
              '--node-x': `${position.x}%`,
              '--node-y': `${position.y}%`,
              '--node-size': `${size}px`,
              '--node-color': ASSET_COLORS[index],
            }}
            key={asset.key}
          >
            <AssetIcon asset={asset} size={index === 0 ? 42 : 30} />
            <span><strong>{asset.symbol}</strong><small>{formatPercent(asset.allocation)}%</small></span>
          </div>
        )
      })}
    </div>
  )
}

function OrbitDashboard({ snapshot }) {
  return (
    <section className='lab-concept lab-orbit' aria-labelledby='orbit-title'>
      <header className='orbit-masthead'>
        <LabBrand variant='orbit' />
        <div className='orbit-live-status'><i /> Данные актуальны</div>
      </header>

      <div className='orbit-hero'>
        <div className='orbit-intro'>
          <span className='lab-overline'>Design Lab · 03 / Spatial capital</span>
          <h1 id='orbit-title'>Ваш капитал.<br /><i>В движении.</i></h1>
          <p>
            Живая карта портфеля: размер каждого объекта соответствует его реальной
            доле, связи показывают структуру капитала.
          </p>
        </div>

        <div className='orbit-visual'>
          <OrbitMap holdings={snapshot.sortedHoldings} />
          <div className='orbit-total'>
            <span>Чистая стоимость</span>
            <strong>{formatCurrency(snapshot.portfolioBalance)}</strong>
            <b className={`is-${valueStatus(snapshot.portfolioProfitPercent)}`}>
              <RiseOutlined aria-hidden='true' />
              {formatPercent(snapshot.portfolioProfitPercent, 'exceptZero')}%
            </b>
          </div>
        </div>
      </div>

      <div className='orbit-command-strip'>
        <div>
          <span>Импульс 24 ч</span>
          <strong className={`is-${valueStatus(snapshot.portfolioDailyChange)}`}>
            {formatCurrency(snapshot.portfolioDailyChangeValue)}
          </strong>
          <small>{formatPercent(snapshot.portfolioDailyChange, 'exceptZero')}%</small>
        </div>
        <div>
          <span>За всё время</span>
          <strong>{formatCurrency(snapshot.portfolioProfit)}</strong>
          <small>чистый результат</small>
        </div>
        <div>
          <span>Защитная доля</span>
          <strong>{formatPercent(snapshot.stableShare)}%</strong>
          <small>стабильные активы</small>
        </div>
        <a href='#analytics'>
          <SafetyCertificateOutlined aria-hidden='true' />
          <span>Индекс устойчивости</span>
          <strong>{100 - snapshot.riskScore}/100</strong>
          <ArrowRightOutlined aria-hidden='true' />
        </a>
      </div>

      <div className='orbit-lower-grid'>
        <article className='orbit-trajectory'>
          <div className='lab-section-heading'>
            <span>Траектория</span>
            <h2>30 дней движения</h2>
            <b>+3,00%</b>
          </div>
          <PerformanceLine balance={snapshot.portfolioBalance} id='orbit' />
        </article>

        <aside className='orbit-focus'>
          <div className='lab-section-heading'>
            <span>В фокусе</span>
            <h2>Ядро портфеля</h2>
          </div>
          <AllocationRing
            holdings={snapshot.sortedHoldings}
            label={snapshot.sortedHoldings[0]?.name ?? '—'}
          />
          <div className='orbit-focus-copy'>
            <strong>{snapshot.sortedHoldings[0]?.name ?? 'Нет данных'}</strong>
            <span>{formatCurrency(snapshot.sortedHoldings[0]?.totalAmount ?? 0)}</span>
          </div>
          <a href='#assets'>Управлять составом</a>
        </aside>
      </div>
    </section>
  )
}

export default function DashboardDesignLab({
  concept,
  snapshot,
  userPortfolio,
}) {
  const variants = {
    'dashboard-aperture': (
      <ApertureDashboard
        snapshot={snapshot}
        userPortfolio={userPortfolio}
      />
    ),
    'dashboard-ledger': (
      <LedgerDashboard snapshot={snapshot} />
    ),
    'dashboard-orbit': (
      <OrbitDashboard snapshot={snapshot} />
    ),
  }

  return (
    <div className='dashboard-design-lab'>
      <LabNavigation activeConcept={concept} />
      {variants[concept] ?? variants['dashboard-aperture']}
    </div>
  )
}
