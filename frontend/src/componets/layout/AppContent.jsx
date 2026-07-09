import { useMemo, useState } from 'react'

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BankOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FireOutlined,
  FundOutlined,
  GlobalOutlined,
  LineChartOutlined,
  PieChartOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SlidersOutlined,
  StockOutlined,
  SwapOutlined,
  TableOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Card, Flex, Layout, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

import AssetsTable from './AssetsTable'
import PortfolioChart from './PortfolioChart'
import PortfolioPerformanceChart from './PortfolioPerformanceChart'

const stableCoinSymbols = new Set(['USDT', 'USDC', 'DAI'])

function getValueStatus(value) {
  if (value > 0) {
    return 'positive'
  }

  if (value < 0) {
    return 'negative'
  }

  return 'neutral'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
  }).format(Number.isFinite(value) ? value : 0)
}

function formatAmount(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getAssetSignedChange(asset) {
  return asset.grow ? asset.growPercent : -asset.growPercent
}

function buildPortfolioSnapshot(userPortfolio, marketCoins) {
  const portfolioBalance = userPortfolio.reduce(
    (totalBalance, portfolioCoin) => totalBalance + portfolioCoin.totalAmount,
    0
  )

  const portfolioProfit = userPortfolio.reduce(
    (totalProfit, portfolioCoin) => totalProfit + portfolioCoin.totalProfit,
    0
  )

  const portfolioInvested = userPortfolio.reduce(
    (totalInvested, portfolioCoin) =>
      totalInvested + portfolioCoin.amount * portfolioCoin.price,
    0
  )

  const enrichedHoldings = userPortfolio.map((portfolioCoin, index) => {
    const marketCoin = marketCoins.find((coin) => coin.id === portfolioCoin.id)
    const allocation = portfolioBalance
      ? (portfolioCoin.totalAmount / portfolioBalance) * 100
      : 0

    return {
      ...portfolioCoin,
      allocation,
      currentPrice: marketCoin?.price ?? portfolioCoin.price,
      icon: marketCoin?.icon,
      key: `${portfolioCoin.id}-${portfolioCoin.date?.getTime?.() ?? index}-${index}`,
      marketCap: marketCoin?.marketCap ?? 0,
      priceChange1d: marketCoin?.priceChange1d ?? 0,
      rank: marketCoin?.rank,
      signedChange: getAssetSignedChange(portfolioCoin),
      symbol: marketCoin?.symbol ?? portfolioCoin.id.toUpperCase(),
    }
  })

  const sortedHoldings = [...enrichedHoldings].sort(
    (firstCoin, secondCoin) => secondCoin.totalAmount - firstCoin.totalAmount
  )

  const positiveCoinsCount = enrichedHoldings.filter(
    (portfolioCoin) => portfolioCoin.grow
  ).length

  const portfolioProfitPercent = portfolioInvested
    ? (portfolioProfit / portfolioInvested) * 100
    : 0

  const portfolioDailyChange = portfolioBalance
    ? enrichedHoldings.reduce(
        (dailyChange, portfolioCoin) =>
          dailyChange + portfolioCoin.totalAmount * portfolioCoin.priceChange1d,
        0
      ) / portfolioBalance
    : 0

  const portfolioDailyChangeValue = (portfolioBalance * portfolioDailyChange) / 100

  const stableShare = portfolioBalance
    ? (enrichedHoldings.reduce((stableValue, portfolioCoin) => {
        if (!stableCoinSymbols.has(portfolioCoin.symbol)) {
          return stableValue
        }

        return stableValue + portfolioCoin.totalAmount
      }, 0) /
        portfolioBalance) *
      100
    : 0

  const bestAsset = [...enrichedHoldings].sort(
    (firstAsset, secondAsset) =>
      secondAsset.signedChange - firstAsset.signedChange
  )[0]

  const largestAssetShare =
    enrichedHoldings.length && portfolioBalance
      ? Math.max(
          ...enrichedHoldings.map((portfolioCoin) => portfolioCoin.allocation)
        )
      : 0

  const riskScore = Math.min(
    96,
    Math.max(
      8,
      Math.round(
        24 +
          largestAssetShare * 0.46 +
          Math.abs(portfolioProfitPercent) * 2.2 -
          stableShare * 0.18
      )
    )
  )

  const transactions = [...enrichedHoldings]
    .sort(
      (firstAsset, secondAsset) =>
        (secondAsset.date?.getTime?.() ?? 0) - (firstAsset.date?.getTime?.() ?? 0)
    )
    .map((asset) => ({
      ...asset,
      entryValue: asset.amount * asset.price,
      type: 'Buy',
    }))

  return {
    bestAsset,
    largestAssetShare,
    portfolioBalance,
    portfolioDailyChange,
    portfolioDailyChangeValue,
    portfolioInvested,
    portfolioProfit,
    portfolioProfitPercent,
    positiveCoinsCount,
    riskScore,
    sortedHoldings,
    stableShare,
    transactions,
  }
}

function KpiCard({
  detail,
  icon,
  status = 'neutral',
  title,
  trend,
  value,
}) {
  return (
    <Card className='dashboard-card kpi-card'>
      <Flex className='kpi-card-content' align='flex-start' gap={12}>
        <span className={`kpi-icon is-${status}`}>{icon}</span>

        <div className='kpi-copy'>
          <Typography.Text className='kpi-label'>{title}</Typography.Text>

          <Typography.Title className={`kpi-value is-${status}`} level={3}>
            {value}
          </Typography.Title>

          <Flex className='kpi-meta-row' align='center' gap={8}>
            {trend && (
              <span className={`kpi-trend-pill is-${status}`}>{trend}</span>
            )}

            {detail && (
              <Typography.Text className='kpi-detail'>{detail}</Typography.Text>
            )}
          </Flex>
        </div>
      </Flex>
    </Card>
  )
}

function SummaryTile({
  detail,
  icon,
  label,
  status = 'neutral',
  value,
}) {
  return (
    <Card className='dashboard-card summary-tile'>
      <span className={`summary-tile-icon is-${status}`}>{icon}</span>
      <Typography.Text>{label}</Typography.Text>
      <Typography.Title className={`is-${status}`} level={3}>
        {value}
      </Typography.Title>
      {detail && <span>{detail}</span>}
    </Card>
  )
}

function HeaderMetric({ label, value, status = 'neutral' }) {
  return (
    <div className={`dashboard-header-metric is-${status}`}>
      <Typography.Text>{label}</Typography.Text>
      <strong>{value}</strong>
    </div>
  )
}

function SectionPage({ actions, children, description, eyebrow, title }) {
  return (
    <div className='product-page'>
      <div className='product-page-header'>
        <div className='dashboard-title-stack'>
          <span className='dashboard-eyebrow'>{eyebrow}</span>
          <Typography.Title level={2}>{title}</Typography.Title>
          <Typography.Text>{description}</Typography.Text>
        </div>

        {actions && <div className='product-page-actions'>{actions}</div>}
      </div>

      {children}
    </div>
  )
}

function SearchControl({ onChange, placeholder, value }) {
  return (
    <label className='page-search-control'>
      <SearchOutlined />
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function ModuleAction({ children, onClick }) {
  return (
    <button className='module-link-button' type='button' onClick={onClick}>
      {children}
    </button>
  )
}

function MarketPulse({ marketCoins, onNavigate }) {
  const marketRows = [...marketCoins]
    .sort((firstCoin, secondCoin) => firstCoin.rank - secondCoin.rank)
    .slice(0, 4)

  const positiveCoins = marketRows.filter(
    (coin) => coin.priceChange1d >= 0
  ).length

  return (
    <Card className='dashboard-card market-pulse-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Market pulse</Typography.Title>
          <Typography.Text>Top assets and 24h movement</Typography.Text>
        </div>

        <ModuleAction onClick={() => onNavigate('markets')}>Open</ModuleAction>
      </div>

      <div className='market-pulse-list'>
        {marketRows.map((coin) => {
          const status = getValueStatus(coin.priceChange1d)

          return (
            <div className='market-pulse-row' key={coin.id}>
              <span className='market-rank'>#{coin.rank}</span>

              <img className='market-coin-icon' src={coin.icon} alt={coin.name} />

              <div className='market-coin-meta'>
                <Typography.Text className='market-coin-name'>
                  {coin.name}
                </Typography.Text>
                <Typography.Text className='market-coin-symbol'>
                  {coin.symbol}
                </Typography.Text>
              </div>

              <div className='market-coin-values'>
                <Typography.Text className='market-price'>
                  {formatCompactCurrency(coin.price)}
                </Typography.Text>
                <span className={`market-change is-${status}`}>
                  {formatPercent(coin.priceChange1d, {
                    signDisplay: 'exceptZero',
                  })}
                  %
                </span>
              </div>
            </div>
          )
        })}

        {!marketRows.length && (
          <div className='empty-card-state'>
            <Typography.Text type='secondary'>
              Market rows will appear after demo data loads.
            </Typography.Text>
          </div>
        )}
      </div>

      <div className='market-pulse-footer'>
        <span className='module-badge is-positive'>
          {positiveCoins}/{marketRows.length} up
        </span>
        <span>Ranked by market cap</span>
      </div>
    </Card>
  )
}

function RiskHealthCard({
  bestAsset,
  concentration,
  onNavigate,
  portfolioProfitPercent,
  riskScore,
  stableShare,
  userPortfolio,
}) {
  const healthRows = [
    {
      label: 'Best asset',
      value: bestAsset?.name ?? 'No data',
      detail: bestAsset
        ? `${formatPercent(bestAsset.signedChange, {
            signDisplay: 'exceptZero',
          })}% since entry`
        : 'Add assets to compare',
      icon: <TrophyOutlined />,
      status: bestAsset ? getValueStatus(bestAsset.signedChange) : 'neutral',
    },
    {
      label: 'Stable share',
      value: `${formatPercent(stableShare)}%`,
      detail: 'USDT, USDC, DAI',
      icon: <SafetyCertificateOutlined />,
      status: stableShare > 0 ? 'positive' : 'neutral',
    },
    {
      label: 'Portfolio ROI',
      value: `${formatPercent(portfolioProfitPercent, {
        signDisplay: 'exceptZero',
      })}%`,
      detail: 'Compared with entry price',
      icon: <LineChartOutlined />,
      status: getValueStatus(portfolioProfitPercent),
    },
  ]

  return (
    <Card className='dashboard-card risk-health-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Risk & health</Typography.Title>
          <Typography.Text>Exposure and portfolio quality</Typography.Text>
        </div>

        {onNavigate ? (
          <ModuleAction onClick={() => onNavigate('analytics')}>
            Review
          </ModuleAction>
        ) : (
          <span className={`module-badge is-${riskScore < 70 ? 'positive' : 'warning'}`}>
            {riskScore}/100
          </span>
        )}
      </div>

      <div className='risk-score-block'>
        <span className='risk-orbit' style={{ '--risk-score': `${riskScore}%` }} />
        <div>
          <Typography.Text>Risk score</Typography.Text>
          <Typography.Title level={3}>{riskScore}</Typography.Title>
          <Typography.Text type='secondary'>
            {riskScore < 45 ? 'Balanced' : riskScore < 70 ? 'Moderate' : 'Concentrated'}
          </Typography.Text>
        </div>
      </div>

      <div className='insight-list'>
        {healthRows.map((row) => (
          <div className='insight-row' key={row.label}>
            <span className={`insight-icon is-${row.status}`}>{row.icon}</span>
            <div>
              <Typography.Text className='insight-label'>{row.label}</Typography.Text>
              <Typography.Text className={`insight-value is-${row.status}`}>
                {row.value}
              </Typography.Text>
              <Typography.Text className='insight-detail'>{row.detail}</Typography.Text>
            </div>
          </div>
        ))}
      </div>

      <div className='risk-bars'>
        <div>
          <span>Largest position</span>
          <strong>{formatPercent(concentration)}%</strong>
        </div>
        <div className='risk-bar-track'>
          <span style={{ width: `${Math.min(concentration, 100)}%` }} />
        </div>
        <div>
          <span>Positions</span>
          <strong>{userPortfolio.length}</strong>
        </div>
      </div>
    </Card>
  )
}

function RecentActivity({ onNavigate, userPortfolio }) {
  const activityRows = [...userPortfolio]
    .sort(
      (firstAsset, secondAsset) =>
        (secondAsset.date?.getTime?.() ?? 0) - (firstAsset.date?.getTime?.() ?? 0)
    )
    .slice(0, 3)

  return (
    <Card className='dashboard-card recent-activity-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Recent activity</Typography.Title>
          <Typography.Text>Latest portfolio entries</Typography.Text>
        </div>

        <ModuleAction onClick={() => onNavigate('transactions')}>
          View all
        </ModuleAction>
      </div>

      <div className='activity-list'>
        {activityRows.map((asset, index) => {
          const value = asset.amount * asset.price
          const date = asset.date instanceof Date ? asset.date : new Date()

          return (
            <div className='activity-row' key={`${asset.id}-${index}`}>
              <span className='activity-icon'>
                {asset.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              </span>

              <div>
                <Typography.Text className='activity-title'>
                  Bought {asset.name}
                </Typography.Text>
                <Typography.Text className='activity-subtitle'>
                  {formatAmount(asset.amount)} {asset.symbol ?? ''} at{' '}
                  {formatCurrency(asset.price)}
                </Typography.Text>
              </div>

              <div className='activity-value'>
                <strong>{formatCurrency(value)}</strong>
                <span>
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }).format(date)}
                </span>
              </div>
            </div>
          )
        })}

        {!activityRows.length && (
          <div className='empty-card-state'>
            <Typography.Text type='secondary'>
              New purchases will appear here.
            </Typography.Text>
          </div>
        )}
      </div>
    </Card>
  )
}

function DashboardView({
  onNavigate,
  snapshot,
  themeName,
  userPortfolio,
  marketCoins,
}) {
  const profitIcon =
    snapshot.portfolioProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />

  return (
    <>
      <div className='dashboard-header'>
        <div className='dashboard-title-stack'>
          <span className='dashboard-eyebrow'>Crypto Portfolio</span>
          <Typography.Title level={2}>Dashboard</Typography.Title>

          <Typography.Text>
            Premium overview of value, performance, holdings, and portfolio
            exposure.
          </Typography.Text>
        </div>

        <div className='dashboard-header-metrics'>
          <HeaderMetric
            label='Balance'
            value={formatCompactCurrency(snapshot.portfolioBalance)}
          />
          <HeaderMetric
            label='24h'
            value={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}%`}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />
          <HeaderMetric label='Risk' value={`${snapshot.riskScore}/100`} status='accent' />
        </div>
      </div>

      <div className='dashboard-board'>
        <div className='dashboard-command-grid'>
          <Card className='dashboard-card dashboard-hero-card'>
            <div className='dashboard-hero-copy'>
              <span className='dashboard-hero-kicker'>Total Portfolio Value</span>
              <Typography.Title level={3}>
                {formatCurrency(snapshot.portfolioBalance)}
              </Typography.Title>
              <Typography.Text>
                {snapshot.positiveCoinsCount} of {userPortfolio.length} positions are
                in profit. Current ROI is{' '}
                {formatPercent(snapshot.portfolioProfitPercent, {
                  signDisplay: 'exceptZero',
                })}
                %.
              </Typography.Text>
            </div>

            <div className='dashboard-hero-modules'>
              <div className='hero-module'>
                <FireOutlined />
                <span>Best asset</span>
                <strong>{snapshot.bestAsset?.name ?? 'No data'}</strong>
              </div>
              <div className='hero-module'>
                <ClockCircleOutlined />
                <span>Updated</span>
                <strong>Live demo</strong>
              </div>
              <div className='hero-module'>
                <SwapOutlined />
                <span>24h movement</span>
                <strong>
                  {formatPercent(snapshot.portfolioDailyChange, {
                    signDisplay: 'exceptZero',
                  })}
                  %
                </strong>
              </div>
            </div>
          </Card>

          <KpiCard
            title='Total balance'
            value={formatCurrency(snapshot.portfolioBalance)}
            trend={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}% 24h`}
            detail='Current market value'
            icon={<WalletOutlined />}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />

          <KpiCard
            title='24h change'
            value={formatCurrency(snapshot.portfolioDailyChangeValue)}
            trend={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}%`}
            detail='Weighted by holdings'
            icon={<LineChartOutlined />}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />

          <KpiCard
            title='Total P/L'
            value={formatCurrency(snapshot.portfolioProfit)}
            trend={`${formatPercent(snapshot.portfolioProfitPercent, {
              signDisplay: 'exceptZero',
            })}%`}
            detail='Since entry'
            icon={profitIcon}
            status={getValueStatus(snapshot.portfolioProfit)}
          />

          <KpiCard
            title='Assets count'
            value={userPortfolio.length}
            trend={`${snapshot.positiveCoinsCount} positive`}
            detail='Across tracked positions'
            icon={<FundOutlined />}
            status={snapshot.positiveCoinsCount ? 'positive' : 'neutral'}
          />
        </div>

        <div className='dashboard-workspace-grid'>
          <div className='dashboard-panel dashboard-panel-performance'>
            <PortfolioPerformanceChart
              portfolioBalance={snapshot.portfolioBalance}
              portfolioDailyChange={snapshot.portfolioDailyChange}
              portfolioProfit={snapshot.portfolioProfit}
              portfolioProfitPercent={snapshot.portfolioProfitPercent}
              themeName={themeName}
            />
          </div>

          <div className='dashboard-panel dashboard-panel-allocation'>
            <PortfolioChart onNavigate={onNavigate} themeName={themeName} />
          </div>

          <div className='dashboard-panel dashboard-panel-holdings'>
            <AssetsTable onNavigate={onNavigate} />
          </div>

          <div className='dashboard-panel dashboard-panel-risk'>
            <RiskHealthCard
              bestAsset={snapshot.bestAsset}
              concentration={snapshot.largestAssetShare}
              onNavigate={onNavigate}
              portfolioProfitPercent={snapshot.portfolioProfitPercent}
              riskScore={snapshot.riskScore}
              stableShare={snapshot.stableShare}
              userPortfolio={userPortfolio}
            />
          </div>

        </div>
      </div>
    </>
  )
}

function AssetsPage({ onOpenAddAsset, snapshot }) {
  const [query, setQuery] = useState('')
  const filteredHoldings = snapshot.sortedHoldings.filter((asset) => {
    const searchText = `${asset.name} ${asset.symbol}`.toLowerCase()
    return searchText.includes(query.toLowerCase())
  })

  return (
    <SectionPage
      eyebrow='Portfolio'
      title='Assets'
      description='Positions, allocations, entry prices, and current unrealized performance.'
      actions={
        <Button
          className='page-primary-action'
          icon={<PlusOutlined />}
          type='primary'
          onClick={onOpenAddAsset}
        >
          Add Asset
        </Button>
      }
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<WalletOutlined />}
          label='Current value'
          value={formatCurrency(snapshot.portfolioBalance)}
          detail='Across all holdings'
          status='accent'
        />
        <SummaryTile
          icon={<BankOutlined />}
          label='Invested'
          value={formatCurrency(snapshot.portfolioInvested)}
          detail='Entry cost basis'
        />
        <SummaryTile
          icon={<PieChartOutlined />}
          label='Largest position'
          value={`${formatPercent(snapshot.largestAssetShare)}%`}
          detail={snapshot.sortedHoldings[0]?.symbol ?? 'No assets'}
          status={snapshot.largestAssetShare > 45 ? 'warning' : 'positive'}
        />
        <SummaryTile
          icon={<LineChartOutlined />}
          label='Unrealized P/L'
          value={formatCurrency(snapshot.portfolioProfit)}
          detail={`${formatPercent(snapshot.portfolioProfitPercent, {
            signDisplay: 'exceptZero',
          })}% ROI`}
          status={getValueStatus(snapshot.portfolioProfit)}
        />
      </div>

      <Card className='dashboard-card product-table-card'>
        <div className='product-card-header'>
          <div>
            <Typography.Title level={4}>Holdings</Typography.Title>
            <Typography.Text>Search and scan every tracked position.</Typography.Text>
          </div>

          <SearchControl
            value={query}
            onChange={setQuery}
            placeholder='Search holdings...'
          />
        </div>

        <div className='product-table asset-table'>
          <div className='product-table-head'>
            <span>Asset</span>
            <span>Holdings</span>
            <span>Allocation</span>
            <span>Value</span>
            <span>P/L</span>
            <span>24h</span>
          </div>

          {filteredHoldings.map((asset) => {
            const profitStatus = getValueStatus(asset.totalProfit)
            const dailyStatus = getValueStatus(asset.priceChange1d)

            return (
              <div className='product-table-row' key={asset.key}>
                <div className='asset-cell'>
                  <img src={asset.icon} alt={asset.name} />
                  <div>
                    <strong>{asset.name}</strong>
                    <span>{asset.symbol}</span>
                  </div>
                </div>

                <div>
                  <strong>
                    {formatAmount(asset.amount)} {asset.symbol}
                  </strong>
                  <span>Entry {formatCurrency(asset.price)}</span>
                </div>

                <div className='allocation-cell'>
                  <strong>{formatPercent(asset.allocation)}%</strong>
                  <i>
                    <b style={{ width: `${Math.min(asset.allocation, 100)}%` }} />
                  </i>
                </div>

                <div>
                  <strong>{formatCurrency(asset.totalAmount)}</strong>
                  <span>{formatCurrency(asset.currentPrice)} spot</span>
                </div>

                <div>
                  <strong className={`is-${profitStatus}`}>
                    {formatCurrency(asset.totalProfit)}
                  </strong>
                  <span className={`is-${profitStatus}`}>
                    {formatPercent(asset.signedChange, {
                      signDisplay: 'exceptZero',
                    })}
                    %
                  </span>
                </div>

                <div>
                  <strong className={`is-${dailyStatus}`}>
                    {formatPercent(asset.priceChange1d, {
                      signDisplay: 'exceptZero',
                    })}
                    %
                  </strong>
                  <span>Rank #{asset.rank ?? '-'}</span>
                </div>
              </div>
            )
          })}

          {!filteredHoldings.length && (
            <div className='empty-card-state'>
              <Typography.Text type='secondary'>
                No holdings match this search.
              </Typography.Text>
            </div>
          )}
        </div>
      </Card>
    </SectionPage>
  )
}

function PositionReturnList({ holdings }) {
  return (
    <Card className='dashboard-card position-return-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Position returns</Typography.Title>
          <Typography.Text>Unrealized contribution by holding</Typography.Text>
        </div>
      </div>

      <div className='position-return-list'>
        {holdings.map((asset) => {
          const status = getValueStatus(asset.totalProfit)

          return (
            <div className='position-return-row' key={asset.key}>
              <div className='asset-cell'>
                <img src={asset.icon} alt={asset.name} />
                <div>
                  <strong>{asset.symbol}</strong>
                  <span>{asset.name}</span>
                </div>
              </div>

              <div className='return-track'>
                <i>
                  <b
                    className={`is-${status}`}
                    style={{
                      width: `${Math.min(Math.abs(asset.signedChange), 100)}%`,
                    }}
                  />
                </i>
              </div>

              <div className='return-value'>
                <strong className={`is-${status}`}>
                  {formatCurrency(asset.totalProfit)}
                </strong>
                <span className={`is-${status}`}>
                  {formatPercent(asset.signedChange, {
                    signDisplay: 'exceptZero',
                  })}
                  %
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function AnalyticsPage({ snapshot, themeName, userPortfolio }) {
  return (
    <SectionPage
      eyebrow='Insights'
      title='Analytics'
      description='Performance, ROI, allocation, and risk signals for the portfolio.'
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<LineChartOutlined />}
          label='ROI'
          value={`${formatPercent(snapshot.portfolioProfitPercent, {
            signDisplay: 'exceptZero',
          })}%`}
          detail='Since entry'
          status={getValueStatus(snapshot.portfolioProfitPercent)}
        />
        <SummaryTile
          icon={<ArrowUpOutlined />}
          label='24h move'
          value={formatCurrency(snapshot.portfolioDailyChangeValue)}
          detail={`${formatPercent(snapshot.portfolioDailyChange, {
            signDisplay: 'exceptZero',
          })}% weighted`}
          status={getValueStatus(snapshot.portfolioDailyChange)}
        />
        <SummaryTile
          icon={<SafetyCertificateOutlined />}
          label='Risk score'
          value={`${snapshot.riskScore}/100`}
          detail={snapshot.riskScore < 70 ? 'Healthy range' : 'Concentrated'}
          status={snapshot.riskScore < 70 ? 'positive' : 'warning'}
        />
        <SummaryTile
          icon={<SlidersOutlined />}
          label='Stable share'
          value={`${formatPercent(snapshot.stableShare)}%`}
          detail='USDT, USDC, DAI'
          status={snapshot.stableShare > 0 ? 'positive' : 'neutral'}
        />
      </div>

      <div className='analytics-page-grid'>
        <div className='analytics-main-column'>
          <PortfolioPerformanceChart
            portfolioBalance={snapshot.portfolioBalance}
            portfolioDailyChange={snapshot.portfolioDailyChange}
            portfolioProfit={snapshot.portfolioProfit}
            portfolioProfitPercent={snapshot.portfolioProfitPercent}
            themeName={themeName}
          />
          <PositionReturnList holdings={snapshot.sortedHoldings} />
        </div>

        <div className='analytics-side-column'>
          <RiskHealthCard
            bestAsset={snapshot.bestAsset}
            concentration={snapshot.largestAssetShare}
            portfolioProfitPercent={snapshot.portfolioProfitPercent}
            riskScore={snapshot.riskScore}
            stableShare={snapshot.stableShare}
            userPortfolio={userPortfolio}
          />
          <PortfolioChart themeName={themeName} />
        </div>
      </div>
    </SectionPage>
  )
}

function MarketMiniList({ coins, title }) {
  return (
    <Card className='dashboard-card market-mini-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>{title}</Typography.Title>
          <Typography.Text>24h movement</Typography.Text>
        </div>
      </div>

      <div className='market-mini-list'>
        {coins.map((coin) => {
          const status = getValueStatus(coin.priceChange1d)

          return (
            <div className='market-mini-row' key={coin.id}>
              <div className='asset-cell'>
                <img src={coin.icon} alt={coin.name} />
                <div>
                  <strong>{coin.symbol}</strong>
                  <span>{coin.name}</span>
                </div>
              </div>
              <strong className={`is-${status}`}>
                {formatPercent(coin.priceChange1d, {
                  signDisplay: 'exceptZero',
                })}
                %
              </strong>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function MarketsPage({ marketCoins, onOpenAddAsset, snapshot }) {
  const [query, setQuery] = useState('')
  const filteredCoins = marketCoins
    .filter((coin) => {
      const searchText = `${coin.name} ${coin.symbol}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })
    .sort((firstCoin, secondCoin) => firstCoin.rank - secondCoin.rank)

  const topGainers = [...marketCoins]
    .sort((firstCoin, secondCoin) => secondCoin.priceChange1d - firstCoin.priceChange1d)
    .slice(0, 4)
  const topLosers = [...marketCoins]
    .sort((firstCoin, secondCoin) => firstCoin.priceChange1d - secondCoin.priceChange1d)
    .slice(0, 4)
  const topVolume = marketCoins
    .slice(0, 10)
    .reduce((totalVolume, coin) => totalVolume + (coin.volume ?? 0), 0)

  return (
    <SectionPage
      eyebrow='Discovery'
      title='Markets'
      description='Market context for the assets you track, without turning the app into an exchange.'
      actions={
        <Button
          className='page-primary-action'
          icon={<PlusOutlined />}
          type='primary'
          onClick={onOpenAddAsset}
        >
          Add Asset
        </Button>
      }
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<GlobalOutlined />}
          label='Tracked market'
          value={`${marketCoins.length}`}
          detail='Demo assets'
          status='accent'
        />
        <SummaryTile
          icon={<StockOutlined />}
          label='Top 10 volume'
          value={formatCompactCurrency(topVolume)}
          detail='Reported market volume'
        />
        <SummaryTile
          icon={<WalletOutlined />}
          label='In portfolio'
          value={snapshot.sortedHoldings.length}
          detail='Current holdings'
          status='positive'
        />
        <SummaryTile
          icon={<FireOutlined />}
          label='Best mover'
          value={topGainers[0]?.symbol ?? '-'}
          detail={
            topGainers[0]
              ? `${formatPercent(topGainers[0].priceChange1d, {
                  signDisplay: 'exceptZero',
                })}% 24h`
              : 'No data'
          }
          status='positive'
        />
      </div>

      <div className='markets-grid'>
        <MarketMiniList coins={topGainers} title='Top movers' />
        <MarketMiniList coins={topLosers} title='Pullbacks' />
      </div>

      <Card className='dashboard-card product-table-card'>
        <div className='product-card-header'>
          <div>
            <Typography.Title level={4}>Market list</Typography.Title>
            <Typography.Text>Ranked crypto assets from the demo feed.</Typography.Text>
          </div>

          <SearchControl
            value={query}
            onChange={setQuery}
            placeholder='Search markets...'
          />
        </div>

        <div className='product-table market-table'>
          <div className='product-table-head'>
            <span>Asset</span>
            <span>Price</span>
            <span>1h</span>
            <span>24h</span>
            <span>7d</span>
            <span>Market cap</span>
            <span />
          </div>

          {filteredCoins.slice(0, 12).map((coin) => (
            <div className='product-table-row' key={coin.id}>
              <div className='asset-cell'>
                <img src={coin.icon} alt={coin.name} />
                <div>
                  <strong>{coin.name}</strong>
                  <span>
                    #{coin.rank} {coin.symbol}
                  </span>
                </div>
              </div>
              <strong>{formatCurrency(coin.price)}</strong>
              <strong className={`is-${getValueStatus(coin.priceChange1h)}`}>
                {formatPercent(coin.priceChange1h, { signDisplay: 'exceptZero' })}%
              </strong>
              <strong className={`is-${getValueStatus(coin.priceChange1d)}`}>
                {formatPercent(coin.priceChange1d, { signDisplay: 'exceptZero' })}%
              </strong>
              <strong className={`is-${getValueStatus(coin.priceChange1w)}`}>
                {formatPercent(coin.priceChange1w, { signDisplay: 'exceptZero' })}%
              </strong>
              <strong>{formatCompactCurrency(coin.marketCap)}</strong>
              <Button size='small' type='text' onClick={onOpenAddAsset}>
                Add
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </SectionPage>
  )
}

function TransactionsPage({ onOpenAddAsset, snapshot }) {
  return (
    <SectionPage
      eyebrow='Activity'
      title='Transactions'
      description='A frontend-only ledger of portfolio purchases and their current unrealized result.'
      actions={
        <Button
          className='page-primary-action'
          icon={<PlusOutlined />}
          type='primary'
          onClick={onOpenAddAsset}
        >
          Add Asset
        </Button>
      }
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<SwapOutlined />}
          label='Entries'
          value={snapshot.transactions.length}
          detail='Recorded purchases'
          status='accent'
        />
        <SummaryTile
          icon={<BankOutlined />}
          label='Cost basis'
          value={formatCurrency(snapshot.portfolioInvested)}
          detail='Total invested'
        />
        <SummaryTile
          icon={<WalletOutlined />}
          label='Current value'
          value={formatCurrency(snapshot.portfolioBalance)}
          detail='Market value'
        />
        <SummaryTile
          icon={<LineChartOutlined />}
          label='Unrealized P/L'
          value={formatCurrency(snapshot.portfolioProfit)}
          detail={`${formatPercent(snapshot.portfolioProfitPercent, {
            signDisplay: 'exceptZero',
          })}% ROI`}
          status={getValueStatus(snapshot.portfolioProfit)}
        />
      </div>

      <Card className='dashboard-card product-table-card'>
        <div className='product-card-header'>
          <div>
            <Typography.Title level={4}>Transaction history</Typography.Title>
            <Typography.Text>Purchases added through the portfolio drawer.</Typography.Text>
          </div>
        </div>

        <div className='product-table transaction-table'>
          <div className='product-table-head'>
            <span>Date</span>
            <span>Type</span>
            <span>Asset</span>
            <span>Amount</span>
            <span>Entry</span>
            <span>Current value</span>
            <span>P/L</span>
          </div>

          {snapshot.transactions.map((transaction) => {
            const status = getValueStatus(transaction.totalProfit)

            return (
              <div className='product-table-row' key={transaction.key}>
                <div>
                  <strong>{formatDate(transaction.date)}</strong>
                  <span>Portfolio</span>
                </div>
                <span className='transaction-type-pill'>{transaction.type}</span>
                <div className='asset-cell'>
                  <img src={transaction.icon} alt={transaction.name} />
                  <div>
                    <strong>{transaction.name}</strong>
                    <span>{transaction.symbol}</span>
                  </div>
                </div>
                <strong>
                  {formatAmount(transaction.amount)} {transaction.symbol}
                </strong>
                <strong>{formatCurrency(transaction.entryValue)}</strong>
                <strong>{formatCurrency(transaction.totalAmount)}</strong>
                <div>
                  <strong className={`is-${status}`}>
                    {formatCurrency(transaction.totalProfit)}
                  </strong>
                  <span className={`is-${status}`}>
                    {formatPercent(transaction.signedChange, {
                      signDisplay: 'exceptZero',
                    })}
                    %
                  </span>
                </div>
              </div>
            )
          })}

          {!snapshot.transactions.length && (
            <div className='empty-card-state'>
              <Typography.Text type='secondary'>
                Add an asset to create the first transaction.
              </Typography.Text>
            </div>
          )}
        </div>
      </Card>
    </SectionPage>
  )
}

function SettingsPage() {
  return (
    <SectionPage
      eyebrow='Workspace'
      title='Settings'
      description='Frontend workspace preferences and product status for this portfolio shell.'
    >
      <div className='settings-grid'>
        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <DatabaseOutlined />
          </span>
          <Typography.Title level={4}>Demo data mode</Typography.Title>
          <Typography.Text>
            Portfolio, markets, and transactions are powered by local frontend
            data until a backend phase is started.
          </Typography.Text>
        </Card>

        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <SafetyCertificateOutlined />
          </span>
          <Typography.Title level={4}>Dark product theme</Typography.Title>
          <Typography.Text>
            The interface is locked to the premium dark system from the target
            pack for visual consistency.
          </Typography.Text>
        </Card>

        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <TableOutlined />
          </span>
          <Typography.Title level={4}>Product sections</Typography.Title>
          <Typography.Text>
            Dashboard, Assets, Analytics, Markets, and Transactions are active
            frontend sections.
          </Typography.Text>
        </Card>
      </div>
    </SectionPage>
  )
}

export default function AppContent({
  currentSection,
  onNavigate,
  onOpenAddAsset,
  themeName,
}) {
  const { userPortfolio, marketCoins } = useCrypto()

  const snapshot = useMemo(
    () => buildPortfolioSnapshot(userPortfolio, marketCoins),
    [marketCoins, userPortfolio]
  )

  const sectionContent = {
    dashboard: (
      <DashboardView
        marketCoins={marketCoins}
        onNavigate={onNavigate}
        snapshot={snapshot}
        themeName={themeName}
        userPortfolio={userPortfolio}
      />
    ),
    assets: (
      <AssetsPage onOpenAddAsset={onOpenAddAsset} snapshot={snapshot} />
    ),
    analytics: (
      <AnalyticsPage
        snapshot={snapshot}
        themeName={themeName}
        userPortfolio={userPortfolio}
      />
    ),
    markets: (
      <MarketsPage
        marketCoins={marketCoins}
        onOpenAddAsset={onOpenAddAsset}
        snapshot={snapshot}
      />
    ),
    transactions: (
      <TransactionsPage
        onOpenAddAsset={onOpenAddAsset}
        snapshot={snapshot}
      />
    ),
    settings: <SettingsPage />,
  }

  return (
    <Layout.Content className='dashboard-content'>
      <div className='dashboard-inner'>
        {sectionContent[currentSection] ?? sectionContent.dashboard}
      </div>
    </Layout.Content>
  )
}
