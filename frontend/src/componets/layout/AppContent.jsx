import { useMemo, useState } from 'react'

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BankOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FireOutlined,
  FundOutlined,
  GlobalOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SlidersOutlined,
  StockOutlined,
  SwapOutlined,
  TableOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Card, Flex, Layout, Popconfirm, Tooltip, Typography } from 'antd'

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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
  }).format(Number.isFinite(value) ? value : 0)
}

function formatAmount(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 6,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat('ru-RU', {
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
      type: 'Покупка',
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
          <Typography.Title level={4}>Пульс рынка</Typography.Title>
          <Typography.Text>Крупные активы и движение за 24 ч</Typography.Text>
        </div>

        <ModuleAction onClick={() => onNavigate('markets')}>Открыть</ModuleAction>
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
              Рыночные строки появятся после загрузки демо-данных.
            </Typography.Text>
          </div>
        )}
      </div>

      <div className='market-pulse-footer'>
        <span className='module-badge is-positive'>
          {positiveCoins}/{marketRows.length} растут
        </span>
        <span>По капитализации</span>
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
      label: 'Лучший актив',
      value: bestAsset?.name ?? 'Нет данных',
      detail: bestAsset
        ? `${formatPercent(bestAsset.signedChange, {
            signDisplay: 'exceptZero',
          })}% с момента входа`
        : 'Добавьте активы для сравнения',
      icon: <TrophyOutlined />,
      status: bestAsset ? getValueStatus(bestAsset.signedChange) : 'neutral',
    },
    {
      label: 'Доля стейблов',
      value: `${formatPercent(stableShare)}%`,
      detail: 'USDT, USDC, DAI',
      icon: <SafetyCertificateOutlined />,
      status: stableShare > 0 ? 'positive' : 'neutral',
    },
    {
      label: 'ROI портфеля',
      value: `${formatPercent(portfolioProfitPercent, {
        signDisplay: 'exceptZero',
      })}%`,
      detail: 'Относительно цены входа',
      icon: <LineChartOutlined />,
      status: getValueStatus(portfolioProfitPercent),
    },
  ]

  return (
    <Card className='dashboard-card risk-health-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Риск и здоровье</Typography.Title>
          <Typography.Text>Экспозиция и качество портфеля</Typography.Text>
        </div>

        {onNavigate ? (
          <ModuleAction onClick={() => onNavigate('analytics')}>
            Проверить
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
          <Typography.Text>Оценка риска</Typography.Text>
          <Typography.Title level={3}>{riskScore}</Typography.Title>
          <Typography.Text type='secondary'>
            {riskScore < 45
              ? 'Сбалансировано'
              : riskScore < 70
                ? 'Умеренно'
                : 'Концентрировано'}
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
          <span>Крупнейшая позиция</span>
          <strong>{formatPercent(concentration)}%</strong>
        </div>
        <div className='risk-bar-track'>
          <span style={{ width: `${Math.min(concentration, 100)}%` }} />
        </div>
        <div>
          <span>Позиции</span>
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
          <Typography.Title level={4}>Недавняя активность</Typography.Title>
          <Typography.Text>Последние записи портфеля</Typography.Text>
        </div>

        <ModuleAction onClick={() => onNavigate('transactions')}>
          Все операции
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
                  Покупка {asset.name}
                </Typography.Text>
                <Typography.Text className='activity-subtitle'>
                  {formatAmount(asset.amount)} {asset.symbol ?? ''} по{' '}
                  {formatCurrency(asset.price)}
                </Typography.Text>
              </div>

              <div className='activity-value'>
                <strong>{formatCurrency(value)}</strong>
                <span>
                  {new Intl.DateTimeFormat('ru-RU', {
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
              Новые покупки появятся здесь.
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
          <span className='dashboard-eyebrow'>Криптопортфель</span>
          <Typography.Title level={2}>Обзор</Typography.Title>

          <Typography.Text>
            Краткая сводка по стоимости, доходности, позициям и риску.
          </Typography.Text>
        </div>

        <div className='dashboard-header-metrics'>
          <HeaderMetric
            label='Баланс'
            value={formatCompactCurrency(snapshot.portfolioBalance)}
          />
          <HeaderMetric
            label='24 ч'
            value={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}%`}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />
          <HeaderMetric
            label='Риск'
            value={`${snapshot.riskScore}/100`}
            status='accent'
          />
        </div>
      </div>

      <div className='dashboard-board'>
        <div className='dashboard-command-grid'>
          <Card className='dashboard-card dashboard-hero-card'>
            <div className='dashboard-hero-copy'>
              <span className='dashboard-hero-kicker'>Стоимость портфеля</span>
              <Typography.Title level={3}>
                {formatCurrency(snapshot.portfolioBalance)}
              </Typography.Title>
              <Typography.Text>
                {snapshot.positiveCoinsCount} из {userPortfolio.length} позиций
                в прибыли. Текущий ROI:{' '}
                {formatPercent(snapshot.portfolioProfitPercent, {
                  signDisplay: 'exceptZero',
                })}
                %.
              </Typography.Text>
            </div>

            <div className='dashboard-hero-modules'>
              <div className='hero-module'>
                <FireOutlined />
                <span>Лучший актив</span>
                <strong>{snapshot.bestAsset?.name ?? 'Нет данных'}</strong>
              </div>
              <div className='hero-module'>
                <ClockCircleOutlined />
                <span>Обновлено</span>
                <strong>Демо-данные</strong>
              </div>
              <div className='hero-module'>
                <SwapOutlined />
                <span>Движение 24 ч</span>
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
            title='Баланс'
            value={formatCurrency(snapshot.portfolioBalance)}
            trend={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}% за 24 ч`}
            detail='Текущая рыночная стоимость'
            icon={<WalletOutlined />}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />

          <KpiCard
            title='Изменение 24 ч'
            value={formatCurrency(snapshot.portfolioDailyChangeValue)}
            trend={`${formatPercent(snapshot.portfolioDailyChange, {
              signDisplay: 'exceptZero',
            })}%`}
            detail='Взвешено по позициям'
            icon={<LineChartOutlined />}
            status={getValueStatus(snapshot.portfolioDailyChange)}
          />

          <KpiCard
            title='Общая P/L'
            value={formatCurrency(snapshot.portfolioProfit)}
            trend={`${formatPercent(snapshot.portfolioProfitPercent, {
              signDisplay: 'exceptZero',
            })}%`}
            detail='С момента входа'
            icon={profitIcon}
            status={getValueStatus(snapshot.portfolioProfit)}
          />

          <KpiCard
            title='Активы'
            value={userPortfolio.length}
            trend={`${snapshot.positiveCoinsCount} в плюсе`}
            detail='По всем позициям'
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
            <PortfolioChart
              compact
              onNavigate={onNavigate}
              themeName={themeName}
            />
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

function AssetsPage({ snapshot }) {
  const { removeCoinFromPortfolio } = useCrypto()
  const [query, setQuery] = useState('')
  const filteredHoldings = snapshot.sortedHoldings.filter((asset) => {
    const searchText = `${asset.name} ${asset.symbol}`.toLowerCase()
    return searchText.includes(query.toLowerCase())
  })

  return (
    <SectionPage
      eyebrow='Портфель'
      title='Активы'
      description='Позиции, аллокация, цены входа и текущий нереализованный результат.'
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<WalletOutlined />}
          label='Текущая стоимость'
          value={formatCurrency(snapshot.portfolioBalance)}
          detail='По всем позициям'
          status='accent'
        />
        <SummaryTile
          icon={<BankOutlined />}
          label='Инвестировано'
          value={formatCurrency(snapshot.portfolioInvested)}
          detail='Сумма входа'
        />
        <SummaryTile
          icon={<PieChartOutlined />}
          label='Крупнейшая позиция'
          value={`${formatPercent(snapshot.largestAssetShare)}%`}
          detail={snapshot.sortedHoldings[0]?.symbol ?? 'Нет активов'}
          status={snapshot.largestAssetShare > 45 ? 'warning' : 'positive'}
        />
        <SummaryTile
          icon={<LineChartOutlined />}
          label='Нереализ. P/L'
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
            <Typography.Title level={4}>Позиции</Typography.Title>
            <Typography.Text>Поиск и просмотр всех активов портфеля.</Typography.Text>
          </div>

          <SearchControl
            value={query}
            onChange={setQuery}
            placeholder='Поиск по позициям...'
          />
        </div>

        <div className='product-table asset-table'>
          <div className='product-table-head'>
            <span>Актив</span>
            <span>Позиция</span>
            <span>Доля</span>
            <span>Стоимость</span>
            <span>P/L</span>
            <span>24 ч</span>
            <span>Действие</span>
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
                  <span>Вход {formatCurrency(asset.price)}</span>
                </div>

                <div className='allocation-cell'>
                  <strong>{formatPercent(asset.allocation)}%</strong>
                  <i>
                    <b style={{ width: `${Math.min(asset.allocation, 100)}%` }} />
                  </i>
                </div>

                <div>
                  <strong>{formatCurrency(asset.totalAmount)}</strong>
                  <span>{formatCurrency(asset.currentPrice)} спот</span>
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
                  <span>Ранг #{asset.rank ?? '-'}</span>
                </div>

                <div className='asset-actions-cell'>
                  <Popconfirm
                    title='Удалить актив?'
                    description={`Позиция ${asset.name} будет удалена из портфеля.`}
                    okText='Удалить'
                    cancelText='Отмена'
                    placement='left'
                    onConfirm={() => removeCoinFromPortfolio(asset.entryId)}
                  >
                    <Tooltip title='Удалить'>
                      <Button
                        className='asset-delete-button'
                        danger
                        icon={<DeleteOutlined />}
                        type='text'
                        aria-label={`Удалить ${asset.name}`}
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            )
          })}

          {!filteredHoldings.length && (
            <div className='empty-card-state'>
              <Typography.Text type='secondary'>
                Позиции не найдены.
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
          <Typography.Title level={4}>Доходность позиций</Typography.Title>
          <Typography.Text>Нереализованный вклад каждой позиции</Typography.Text>
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
      eyebrow='Инсайты'
      title='Аналитика'
      description='Динамика, ROI, аллокация и риск-сигналы портфеля.'
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<LineChartOutlined />}
          label='ROI'
          value={`${formatPercent(snapshot.portfolioProfitPercent, {
            signDisplay: 'exceptZero',
          })}%`}
          detail='С момента входа'
          status={getValueStatus(snapshot.portfolioProfitPercent)}
        />
        <SummaryTile
          icon={<ArrowUpOutlined />}
          label='Движение 24 ч'
          value={formatCurrency(snapshot.portfolioDailyChangeValue)}
          detail={`${formatPercent(snapshot.portfolioDailyChange, {
            signDisplay: 'exceptZero',
          })}% взвешенно`}
          status={getValueStatus(snapshot.portfolioDailyChange)}
        />
        <SummaryTile
          icon={<SafetyCertificateOutlined />}
          label='Оценка риска'
          value={`${snapshot.riskScore}/100`}
          detail={snapshot.riskScore < 70 ? 'Норма' : 'Концентрация'}
          status={snapshot.riskScore < 70 ? 'positive' : 'warning'}
        />
        <SummaryTile
          icon={<SlidersOutlined />}
          label='Доля стейблов'
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
          <Typography.Text>Движение за 24 ч</Typography.Text>
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

function MarketsPage({ marketCoins, snapshot }) {
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
      eyebrow='Поиск'
      title='Рынки'
      description='Рыночный контекст для отслеживаемых активов без превращения приложения в биржу.'
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<GlobalOutlined />}
          label='Активов в ленте'
          value={`${marketCoins.length}`}
          detail='Демо-активы'
          status='accent'
        />
        <SummaryTile
          icon={<StockOutlined />}
          label='Объем топ-10'
          value={formatCompactCurrency(topVolume)}
          detail='Заявленный объем'
        />
        <SummaryTile
          icon={<WalletOutlined />}
          label='В портфеле'
          value={snapshot.sortedHoldings.length}
          detail='Текущие позиции'
          status='positive'
        />
        <SummaryTile
          icon={<FireOutlined />}
          label='Лучший рост'
          value={topGainers[0]?.symbol ?? '-'}
          detail={
            topGainers[0]
              ? `${formatPercent(topGainers[0].priceChange1d, {
                  signDisplay: 'exceptZero',
                })}% за 24 ч`
              : 'Нет данных'
          }
          status='positive'
        />
      </div>

      <div className='markets-grid'>
        <MarketMiniList coins={topGainers} title='Лидеры роста' />
        <MarketMiniList coins={topLosers} title='Просадки' />
      </div>

      <Card className='dashboard-card product-table-card'>
        <div className='product-card-header'>
          <div>
            <Typography.Title level={4}>Список рынков</Typography.Title>
            <Typography.Text>Криптоактивы из демо-ленты по рангу.</Typography.Text>
          </div>

          <SearchControl
            value={query}
            onChange={setQuery}
            placeholder='Поиск по рынкам...'
          />
        </div>

        <div className='product-table market-table'>
          <div className='product-table-head'>
            <span>Актив</span>
            <span>Цена</span>
            <span>1 ч</span>
            <span>24 ч</span>
            <span>7 д</span>
            <span>Капитализация</span>
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
            </div>
          ))}
        </div>
      </Card>
    </SectionPage>
  )
}

function TransactionsPage({ snapshot }) {
  return (
    <SectionPage
      eyebrow='История'
      title='Операции'
      description='Фронтенд-журнал покупок и их текущего нереализованного результата.'
    >
      <div className='summary-tile-grid'>
        <SummaryTile
          icon={<SwapOutlined />}
          label='Записи'
          value={snapshot.transactions.length}
          detail='Сохраненные покупки'
          status='accent'
        />
        <SummaryTile
          icon={<BankOutlined />}
          label='Сумма входа'
          value={formatCurrency(snapshot.portfolioInvested)}
          detail='Всего инвестировано'
        />
        <SummaryTile
          icon={<WalletOutlined />}
          label='Текущая стоимость'
          value={formatCurrency(snapshot.portfolioBalance)}
          detail='Рыночная стоимость'
        />
        <SummaryTile
          icon={<LineChartOutlined />}
          label='Нереализ. P/L'
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
            <Typography.Title level={4}>История операций</Typography.Title>
            <Typography.Text>Покупки, добавленные через форму портфеля.</Typography.Text>
          </div>
        </div>

        <div className='product-table transaction-table'>
          <div className='product-table-head'>
            <span>Дата</span>
            <span>Тип</span>
            <span>Актив</span>
            <span>Кол-во</span>
            <span>Вход</span>
            <span>Стоимость</span>
            <span>P/L</span>
          </div>

          {snapshot.transactions.map((transaction) => {
            const status = getValueStatus(transaction.totalProfit)

            return (
              <div className='product-table-row' key={transaction.key}>
                <div>
                  <strong>{formatDate(transaction.date)}</strong>
                  <span>Портфель</span>
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
                Добавьте актив, чтобы создать первую операцию.
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
      eyebrow='Рабочая область'
      title='Настройки'
      description='Фронтенд-настройки и статус демо-продукта.'
    >
      <div className='settings-grid'>
        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <DatabaseOutlined />
          </span>
          <Typography.Title level={4}>Режим демо-данных</Typography.Title>
          <Typography.Text>
            Портфель, рынки и операции работают на локальных фронтенд-данных до
            этапа backend.
          </Typography.Text>
        </Card>

        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <SafetyCertificateOutlined />
          </span>
          <Typography.Title level={4}>Темная продуктовая тема</Typography.Title>
          <Typography.Text>
            Интерфейс закреплен в премиальной темной системе для визуальной
            согласованности.
          </Typography.Text>
        </Card>

        <Card className='dashboard-card settings-card'>
          <span className='settings-icon'>
            <TableOutlined />
          </span>
          <Typography.Title level={4}>Разделы продукта</Typography.Title>
          <Typography.Text>
            Обзор, Активы, Аналитика, Рынки и Операции работают как активные
            фронтенд-разделы.
          </Typography.Text>
        </Card>
      </div>
    </SectionPage>
  )
}

export default function AppContent({
  currentSection,
  onNavigate,
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
    assets: <AssetsPage snapshot={snapshot} />,
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
        snapshot={snapshot}
      />
    ),
    transactions: <TransactionsPage snapshot={snapshot} />,
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
