import { useMemo, useState } from 'react'

import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

import { createPortfolioPerformanceDemoSeries } from '../../demo/portfolioPerformanceDemoData'

const PERFORMANCE_RANGES = [
  { label: '1д', value: '1d' },
  { label: '7д', value: '7d' },
  { label: '30д', value: '30d' },
  { label: 'Всё', value: 'all' },
]

const MAP_POSITIONS = [
  { x: 47, y: 47 },
  { x: 72, y: 25 },
  { x: 76, y: 70 },
  { x: 24, y: 72 },
  { x: 20, y: 28 },
]

const NODE_COLORS = ['#6f9cff', '#55c8ae', '#ad8cff', '#efb65f', '#7f91a8']

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

function getStatus(value) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function PortfolioTrend({ balance }) {
  const [range, setRange] = useState('30d')
  const series = useMemo(
    () => createPortfolioPerformanceDemoSeries(balance, range),
    [balance, range]
  )
  const values = series.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  const points = series.map((point, index) => ({
    ...point,
    x: 2 + (index / Math.max(series.length - 1, 1)) * 96,
    y: 89 - ((point.value - minValue) / valueRange) * 70,
  }))
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPoints = `2,96 ${linePoints} 98,96`
  const firstValue = values[0] ?? balance
  const rangeChange = firstValue ? ((balance - firstValue) / firstValue) * 100 : 0

  return (
    <div className='v2-trend'>
      <div className='v2-trend-toolbar'>
        <div>
          <span>Динамика капитала</span>
          <strong className={`is-${getStatus(rangeChange)}`}>
            {formatPercent(rangeChange, 'exceptZero')}%
          </strong>
        </div>

        <div className='v2-range-control' aria-label='Период графика'>
          {PERFORMANCE_RANGES.map((option) => (
            <button
              className={range === option.value ? 'is-active' : undefined}
              type='button'
              aria-pressed={range === option.value}
              key={option.value}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className='v2-trend-chart'>
        <svg
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          role='img'
          aria-label={`Динамика стоимости портфеля за период ${range}`}
        >
          <defs>
            <linearGradient id='v2-trend-fill' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#6f9cff' stopOpacity='.3' />
              <stop offset='100%' stopColor='#6f9cff' stopOpacity='0' />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill='url(#v2-trend-fill)' />
          <polyline className='v2-trend-line' points={linePoints} />
          <circle
            className='v2-trend-point'
            cx={points.at(-1)?.x ?? 98}
            cy={points.at(-1)?.y ?? 50}
            r='1.8'
          />
        </svg>

        <div className='v2-trend-labels' aria-hidden='true'>
          {series.map((point, index) => (
            <span key={`${point.label}-${index}`}>
              {index === 0 || index === series.length - 1 ? point.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssetNode({ asset, index, isSelected, onSelect }) {
  const position = MAP_POSITIONS[index]
  const size = 48 + Math.min(asset.allocation, 52) * 1.18

  return (
    <button
      className={isSelected ? 'v2-map-node is-selected' : 'v2-map-node'}
      type='button'
      aria-label={`${asset.name}: ${formatPercent(asset.allocation)}% портфеля`}
      aria-pressed={isSelected}
      style={{
        '--node-color': NODE_COLORS[index],
        '--node-size': `${size}px`,
        '--node-x': `${position.x}%`,
        '--node-y': `${position.y}%`,
      }}
      onClick={() => onSelect(asset.key)}
    >
      <img
        src={asset.icon}
        alt=''
        width={index === 0 ? 40 : 28}
        height={index === 0 ? 40 : 28}
      />
      <span>{asset.symbol}</span>
    </button>
  )
}

function AssetMap({ holdings }) {
  const initialKey = holdings[0]?.key ?? null
  const [selectedKey, setSelectedKey] = useState(initialKey)
  const selectedAsset =
    holdings.find((asset) => asset.key === selectedKey) ?? holdings[0]

  if (!holdings.length) {
    return (
      <div className='v2-map-empty'>
        <strong>Карта появится после первой покупки</strong>
        <span>Добавьте актив, чтобы увидеть структуру портфеля.</span>
      </div>
    )
  }

  return (
    <div className='v2-asset-map'>
      <div className='v2-map-heading'>
        <div>
          <span>Структура активов</span>
          <h2>Карта капитала</h2>
        </div>
        <small>Размер = реальная доля</small>
      </div>

      <div className='v2-map-stage'>
        <svg viewBox='0 0 100 100' aria-hidden='true' focusable='false'>
          <circle cx='50' cy='50' r='34' />
          <circle cx='50' cy='50' r='22' />
          {MAP_POSITIONS.slice(1).map((position) => (
            <line
              x1='47'
              y1='47'
              x2={position.x}
              y2={position.y}
              key={`${position.x}-${position.y}`}
            />
          ))}
        </svg>

        {holdings.slice(0, 5).map((asset, index) => (
          <AssetNode
            asset={asset}
            index={index}
            isSelected={selectedAsset?.key === asset.key}
            key={asset.key}
            onSelect={setSelectedKey}
          />
        ))}
      </div>

      <div className='v2-map-detail' aria-live='polite'>
        <div>
          <img
            src={selectedAsset.icon}
            alt=''
            width='32'
            height='32'
          />
          <span>
            <strong>{selectedAsset.name}</strong>
            <small>{formatAmount(selectedAsset.amount)} {selectedAsset.symbol}</small>
          </span>
        </div>
        <span>
          <strong>{formatPercent(selectedAsset.allocation)}%</strong>
          <small>доля</small>
        </span>
        <span>
          <strong>{formatCurrency(selectedAsset.totalAmount)}</strong>
          <small>стоимость</small>
        </span>
      </div>
    </div>
  )
}

function MetricStrip({ snapshot }) {
  const profitStatus = getStatus(snapshot.portfolioProfit)
  const riskLabel =
    snapshot.riskScore < 45
      ? 'Сбалансирован'
      : snapshot.riskScore < 70
        ? 'Умеренный'
        : 'Высокий'

  return (
    <section className='v2-metric-strip' aria-label='Ключевые показатели'>
      <div className='v2-metric-primary'>
        <span>Общий P/L</span>
        <strong className={`is-${profitStatus}`}>
          {formatCurrency(snapshot.portfolioProfit)}
        </strong>
        <small>{formatPercent(snapshot.portfolioProfitPercent, 'exceptZero')}% с момента входа</small>
      </div>

      <div>
        <span>Риск-профиль</span>
        <strong>{snapshot.riskScore}<i>/100</i></strong>
        <small>{riskLabel}</small>
        <b className='v2-metric-bar'><i style={{ width: `${snapshot.riskScore}%` }} /></b>
      </div>

      <div>
        <span>Защитная доля</span>
        <strong>{formatPercent(snapshot.stableShare)}%</strong>
        <small>Стейблкоины</small>
      </div>

      <div>
        <span>Концентрация</span>
        <strong>{formatPercent(snapshot.largestAssetShare)}%</strong>
        <small>Крупнейшая позиция</small>
      </div>

      <a href='#analytics' className='v2-metric-action'>
        <SafetyCertificateOutlined aria-hidden='true' />
        <span>Анализ риска</span>
        <ArrowRightOutlined aria-hidden='true' />
      </a>
    </section>
  )
}

function AnalysisPreview({ marketCoins, snapshot }) {
  const marketLeaders = [...marketCoins]
    .sort((firstCoin, secondCoin) => firstCoin.rank - secondCoin.rank)
    .slice(0, 3)

  return (
    <section className='v2-analysis-preview' aria-labelledby='v2-analysis-title'>
      <div className='v2-analysis-heading'>
        <div>
          <span>Следующий уровень</span>
          <h2 id='v2-analysis-title'>Позиции и рынок</h2>
        </div>
        <a href='#assets'>Все активы <ArrowRightOutlined aria-hidden='true' /></a>
      </div>

      <div className='v2-analysis-columns'>
        <div className='v2-holding-list'>
          {snapshot.sortedHoldings.slice(0, 3).map((asset) => (
            <div className='v2-holding-row' key={asset.key}>
              <img src={asset.icon} alt='' width='30' height='30' loading='lazy' />
              <span><strong>{asset.name}</strong><small>{asset.symbol}</small></span>
              <b>{formatPercent(asset.allocation)}%</b>
              <strong>{formatCurrency(asset.totalAmount)}</strong>
            </div>
          ))}
        </div>

        <div className='v2-market-list'>
          {marketLeaders.map((coin) => (
            <div className='v2-market-row' key={coin.id}>
              <span>#{coin.rank}</span>
              <img src={coin.icon} alt='' width='28' height='28' loading='lazy' />
              <strong>{coin.symbol}</strong>
              <b>{formatCurrency(coin.price, true)}</b>
              <small className={`is-${getStatus(coin.priceChange1d)}`}>
                {formatPercent(coin.priceChange1d, 'exceptZero')}%
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function DashboardV2({ marketCoins, onOpenDrawer, snapshot }) {
  const dayStatus = getStatus(snapshot.portfolioDailyChange)
  const DayIcon = snapshot.portfolioDailyChange >= 0
    ? ArrowUpOutlined
    : ArrowDownOutlined

  return (
    <main className='dashboard-v2' id='dashboard-v2-main'>
      <header className='v2-page-bar'>
        <div>
          <span>Private wealth</span>
          <h1>Обзор капитала</h1>
        </div>
        <div className='v2-sync-status'><i /> Портфель синхронизирован</div>
      </header>

      <section className='v2-command-deck' aria-label='Сводка портфеля'>
        <div className='v2-capital-panel'>
          <div className='v2-balance-row'>
            <div>
              <span>Общая стоимость</span>
              <strong>{formatCurrency(snapshot.portfolioBalance)}</strong>
            </div>
            <div className={`v2-day-change is-${dayStatus}`}>
              <DayIcon aria-hidden='true' />
              <span>
                <strong>{formatPercent(snapshot.portfolioDailyChange, 'exceptZero')}%</strong>
                <small>{formatCurrency(snapshot.portfolioDailyChangeValue)} за 24 часа</small>
              </span>
            </div>
          </div>

          <div className='v2-primary-actions'>
            <button type='button' onClick={onOpenDrawer}>
              <PlusOutlined aria-hidden='true' /> Записать покупку
            </button>
            <a href='#transactions'>История операций</a>
          </div>

          <PortfolioTrend balance={snapshot.portfolioBalance} />
        </div>

        <AssetMap holdings={snapshot.sortedHoldings} />
      </section>

      <MetricStrip snapshot={snapshot} />
      <AnalysisPreview marketCoins={marketCoins} snapshot={snapshot} />
    </main>
  )
}
