import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  FireOutlined,
  FundOutlined,
  LineChartOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Card, Flex, Layout, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

import AssetsTable from './AssetsTable'
import PortfolioAnalytics from './PortfolioAnalytics'
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
  }).format(value)
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
  }).format(value)
}

function getAssetSignedChange(asset) {
  return asset.grow ? asset.growPercent : -asset.growPercent
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

function HeaderMetric({ label, value, status = 'neutral' }) {
  return (
    <div className={`dashboard-header-metric is-${status}`}>
      <Typography.Text>{label}</Typography.Text>
      <strong>{value}</strong>
    </div>
  )
}

function MarketPulse({ marketCoins }) {
  const marketRows = [...marketCoins]
    .sort((firstCoin, secondCoin) => firstCoin.rank - secondCoin.rank)
    .slice(0, 5)

  const positiveCoins = marketRows.filter(
    (coin) => coin.priceChange1d >= 0
  ).length

  return (
    <Card className='dashboard-card market-pulse-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>Рыночный пульс</Typography.Title>
          <Typography.Text>Топ монет и изменение за 24 часа</Typography.Text>
        </div>

        <span className='module-badge'>
          {positiveCoins}/{marketRows.length} в росте
        </span>
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
      </div>
    </Card>
  )
}

function PortfolioInsightPanel({
  bestAsset,
  portfolioBalance,
  portfolioDailyChange,
  portfolioProfitPercent,
  riskScore,
  stableShare,
  userPortfolio,
}) {
  const sortedAssets = [...userPortfolio].sort(
    (firstAsset, secondAsset) => secondAsset.totalAmount - firstAsset.totalAmount
  )

  const concentration = portfolioBalance
    ? ((sortedAssets[0]?.totalAmount ?? 0) / portfolioBalance) * 100
    : 0

  const insightRows = [
    {
      label: 'Лучший актив',
      value: bestAsset?.name ?? 'Нет данных',
      detail: bestAsset
        ? `${formatPercent(getAssetSignedChange(bestAsset), {
            signDisplay: 'exceptZero',
          })}% к цене покупки`
        : 'Добавьте активы',
      icon: <TrophyOutlined />,
      status: bestAsset ? getValueStatus(getAssetSignedChange(bestAsset)) : 'neutral',
    },
    {
      label: '24ч портфеля',
      value: `${formatPercent(portfolioDailyChange, {
        signDisplay: 'exceptZero',
      })}%`,
      detail: 'Взвешено по текущей доле',
      icon: <LineChartOutlined />,
      status: getValueStatus(portfolioDailyChange),
    },
    {
      label: 'Стейбл-доля',
      value: `${formatPercent(stableShare)}%`,
      detail: 'USDT, USDC, DAI',
      icon: <SafetyCertificateOutlined />,
      status: stableShare > 0 ? 'positive' : 'neutral',
    },
  ]

  return (
    <Card className='dashboard-card insight-panel-card'>
      <div className='card-section-heading'>
        <div>
          <Typography.Title level={4}>KPI и статистика</Typography.Title>
          <Typography.Text>Компактная аналитика портфеля</Typography.Text>
        </div>

        <span
          className={`module-badge is-${getValueStatus(portfolioProfitPercent)}`}
        >
          ROI {formatPercent(portfolioProfitPercent, { signDisplay: 'exceptZero' })}%
        </span>
      </div>

      <div className='insight-list'>
        {insightRows.map((row) => (
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

      <div className='risk-module'>
        <Flex align='center' justify='space-between' gap={12}>
          <div>
            <Typography.Text className='risk-label'>
              Риск и концентрация
            </Typography.Text>
            <Typography.Title level={4}>{riskScore}/100</Typography.Title>
          </div>
          <span className='risk-orbit' style={{ '--risk-score': `${riskScore}%` }} />
        </Flex>

        <div className='risk-bars'>
          <div>
            <span>Топ актив</span>
            <strong>{formatPercent(concentration)}%</strong>
          </div>
          <div className='risk-bar-track'>
            <span style={{ width: `${Math.min(concentration, 100)}%` }} />
          </div>
          <div>
            <span>Позиций</span>
            <strong>{userPortfolio.length}</strong>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function AppContent({ themeName }) {
  const { userPortfolio, marketCoins } = useCrypto()

  const portfolioBalance = userPortfolio
    .map((portfolioCoin) => portfolioCoin.totalAmount)
    .reduce((totalBalance, value) => totalBalance + value, 0)

  const portfolioProfit = userPortfolio
    .map((portfolioCoin) => portfolioCoin.totalProfit)
    .reduce((totalProfit, value) => totalProfit + value, 0)

  const portfolioInvested = userPortfolio
    .map((portfolioCoin) => portfolioCoin.amount * portfolioCoin.price)
    .reduce((totalInvested, value) => totalInvested + value, 0)

  const portfolioProfitPercent = portfolioInvested
    ? (portfolioProfit / portfolioInvested) * 100
    : 0

  const positiveCoinsCount = userPortfolio.filter(
    (portfolioCoin) => portfolioCoin.grow
  ).length

  const portfolioDailyChange = portfolioBalance
    ? userPortfolio.reduce((dailyChange, portfolioCoin) => {
        const marketCoin = marketCoins.find(
          (coin) => coin.id === portfolioCoin.id
        )

        return (
          dailyChange +
          portfolioCoin.totalAmount * (marketCoin?.priceChange1d ?? 0)
        )
      }, 0) / portfolioBalance
    : 0

  const stableShare = portfolioBalance
    ? (userPortfolio.reduce((stableValue, portfolioCoin) => {
        const marketCoin = marketCoins.find(
          (coin) => coin.id === portfolioCoin.id
        )

        if (!stableCoinSymbols.has(marketCoin?.symbol)) {
          return stableValue
        }

        return stableValue + portfolioCoin.totalAmount
      }, 0) /
        portfolioBalance) *
      100
    : 0

  const bestAsset = [...userPortfolio].sort(
    (firstAsset, secondAsset) =>
      getAssetSignedChange(secondAsset) - getAssetSignedChange(firstAsset)
  )[0]

  const largestAssetShare = portfolioBalance
    ? Math.max(
        ...userPortfolio.map(
          (portfolioCoin) => (portfolioCoin.totalAmount / portfolioBalance) * 100
        )
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

  const profitIcon =
    portfolioProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />

  return (
    <Layout.Content className='dashboard-content'>
      <div className='dashboard-inner'>
        <div className='dashboard-header'>
          <div className='dashboard-title-stack'>
            <span className='dashboard-eyebrow'>Crypto Portfolio</span>
            <Typography.Title level={2}>Обзор портфеля</Typography.Title>

            <Typography.Text>
              Распределение, доходность и рыночные сигналы в одной плотной
              панели.
            </Typography.Text>
          </div>

          <div className='dashboard-header-metrics'>
            <HeaderMetric label='Баланс' value={formatCompactCurrency(portfolioBalance)} />
            <HeaderMetric
              label='24ч'
              value={`${formatPercent(portfolioDailyChange, {
                signDisplay: 'exceptZero',
              })}%`}
              status={getValueStatus(portfolioDailyChange)}
            />
            <HeaderMetric label='Риск' value={`${riskScore}/100`} status='accent' />
          </div>
        </div>

        <div className='dashboard-board'>
          <Card className='dashboard-card dashboard-hero-card'>
            <div className='dashboard-hero-copy'>
              <span className='dashboard-hero-kicker'>Portfolio command center</span>
              <Typography.Title level={3}>
                {formatCurrency(portfolioBalance)}
              </Typography.Title>
              <Typography.Text>
                {userPortfolio.length} актива в портфеле, {positiveCoinsCount} в
                плюсе. Прибыльность сейчас{' '}
                {formatPercent(portfolioProfitPercent, {
                  signDisplay: 'exceptZero',
                })}
                %.
              </Typography.Text>
            </div>

            <div className='dashboard-hero-modules'>
              <div className='hero-module'>
                <FireOutlined />
                <span>Лучший актив</span>
                <strong>{bestAsset?.name ?? 'Нет данных'}</strong>
              </div>
              <div className='hero-module'>
                <ClockCircleOutlined />
                <span>Обновлено</span>
                <strong>Live demo</strong>
              </div>
              <div className='hero-module'>
                <SwapOutlined />
                <span>Рынок 24ч</span>
                <strong>
                  {formatPercent(portfolioDailyChange, {
                    signDisplay: 'exceptZero',
                  })}
                  %
                </strong>
              </div>
            </div>
          </Card>

          <div className='kpi-grid'>
            <KpiCard
              title='Общая стоимость'
              value={formatCurrency(portfolioBalance)}
              trend={`${formatPercent(portfolioDailyChange, {
                signDisplay: 'exceptZero',
              })}% 24ч`}
              detail='Текущая оценка'
              icon={<WalletOutlined />}
              status={getValueStatus(portfolioDailyChange)}
            />

            <KpiCard
              title='Прибыль / убыток'
              value={formatCurrency(portfolioProfit)}
              trend={`${formatPercent(portfolioProfitPercent, {
                signDisplay: 'exceptZero',
              })}%`}
              detail='От цены покупки'
              icon={profitIcon}
              status={getValueStatus(portfolioProfit)}
            />

            <KpiCard
              title='Инвестировано'
              value={formatCurrency(portfolioInvested)}
              trend={`${userPortfolio.length} позиции`}
              detail='Стоимость входа'
              icon={<PercentageOutlined />}
              status='accent'
            />

            <KpiCard
              title='Активы в плюсе'
              value={`${positiveCoinsCount} / ${userPortfolio.length}`}
              trend={`Риск ${riskScore}`}
              detail='Позиции портфеля'
              icon={<FundOutlined />}
              status={positiveCoinsCount ? 'positive' : 'neutral'}
            />
          </div>

          <div className='dashboard-main-grid'>
            <div className='dashboard-panel dashboard-panel-allocation'>
              <PortfolioChart themeName={themeName} />
            </div>

            <div className='dashboard-panel dashboard-panel-performance'>
              <PortfolioPerformanceChart
                portfolioBalance={portfolioBalance}
                portfolioDailyChange={portfolioDailyChange}
                portfolioProfit={portfolioProfit}
                portfolioProfitPercent={portfolioProfitPercent}
                themeName={themeName}
              />
            </div>

            <div className='dashboard-panel dashboard-panel-analytics'>
              <PortfolioInsightPanel
                bestAsset={bestAsset}
                portfolioBalance={portfolioBalance}
                portfolioDailyChange={portfolioDailyChange}
                portfolioProfitPercent={portfolioProfitPercent}
                riskScore={riskScore}
                stableShare={stableShare}
                userPortfolio={userPortfolio}
              />
            </div>

            <div className='dashboard-panel dashboard-panel-market'>
              <MarketPulse marketCoins={marketCoins} />
            </div>

            <div className='dashboard-panel dashboard-panel-modules'>
              <PortfolioAnalytics
                portfolioBalance={portfolioBalance}
                portfolioDailyChange={portfolioDailyChange}
                portfolioProfit={portfolioProfit}
                portfolioProfitPercent={portfolioProfitPercent}
                stableShare={stableShare}
                userPortfolio={userPortfolio}
              />
            </div>

            <div className='dashboard-panel dashboard-panel-holdings'>
              <AssetsTable />
            </div>
          </div>
        </div>
      </div>
    </Layout.Content>
  )
}
