import { useMemo } from 'react'

import { Avatar, Card, Typography } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value, options = {}) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: options.signDisplay ?? 'auto',
  }).format(value)
}

function getSignedChange(asset) {
  return asset.grow ? asset.growPercent : -asset.growPercent
}

export default function AssetsTable({ onNavigate }) {
  const { userPortfolio, marketCoins } = useCrypto()

  const portfolioBalance = useMemo(
    () =>
      userPortfolio
        .map((portfolioCoin) => portfolioCoin.totalAmount)
        .reduce((totalBalance, value) => totalBalance + value, 0),
    [userPortfolio]
  )

  const holdingRows = useMemo(
    () =>
      [...userPortfolio]
        .sort(
          (firstCoin, secondCoin) =>
            secondCoin.totalAmount - firstCoin.totalAmount
        )
        .slice(0, 5)
        .map((portfolioCoin, index) => {
          const marketCoin = marketCoins.find(
            (coin) => coin.id === portfolioCoin.id
          )
          const allocation = portfolioBalance
            ? (portfolioCoin.totalAmount / portfolioBalance) * 100
            : 0

          return {
            key: `${portfolioCoin.id}-${portfolioCoin.date?.getTime?.() ?? index}-${index}`,
            allocation,
            coinIcon: marketCoin?.icon,
            coinName: portfolioCoin.name,
            coinSymbol: marketCoin?.symbol,
            totalAmount: portfolioCoin.totalAmount,
            totalProfit: portfolioCoin.totalProfit,
            growPercent: getSignedChange(portfolioCoin),
          }
        }),
    [marketCoins, portfolioBalance, userPortfolio]
  )

  return (
    <Card className='dashboard-card holdings-card'>
      <div className='card-section-heading holdings-heading'>
        <div>
          <Typography.Title level={4}>Крупные позиции</Typography.Title>

          <Typography.Text>Самые весомые активы в портфеле</Typography.Text>
        </div>

        <button
          className='module-link-button'
          type='button'
          onClick={() => onNavigate?.('assets')}
        >
          Все активы
        </button>
      </div>

      <div className='holdings-preview-list'>
        {holdingRows.map((coin) => {
          const status = coin.totalProfit >= 0 ? 'positive' : 'negative'

          return (
            <div className='holding-preview-row' key={coin.key}>
              <div className='holding-asset'>
                <Avatar
                  className='asset-token-icon'
                  src={coin.coinIcon}
                  alt={coin.coinName}
                  size={34}
                >
                  {coin.coinSymbol}
                </Avatar>

                <div>
                  <Typography.Text className='asset-name' strong>
                    {coin.coinName}
                  </Typography.Text>
                  <Typography.Text className='asset-symbol' type='secondary'>
                    {coin.coinSymbol}
                  </Typography.Text>
                </div>
              </div>

              <div className='holding-allocation'>
                <span>{formatPercent(coin.allocation)}%</span>
                <i>
                  <b style={{ width: `${Math.min(coin.allocation, 100)}%` }} />
                </i>
              </div>

              <div className='holding-value'>
                <strong>{formatCurrency(coin.totalAmount)}</strong>
                <span className={`is-${status}`}>
                  {formatPercent(coin.growPercent, {
                    signDisplay: 'exceptZero',
                  })}
                  %
                </span>
              </div>
            </div>
          )
        })}

        {!holdingRows.length && (
          <div className='empty-card-state'>
            <Typography.Text type='secondary'>
              Добавьте первый актив, чтобы увидеть позиции.
            </Typography.Text>
          </div>
        )}
      </div>
    </Card>
  )
}
