export const coins = [
  ["BTC", "Bitcoin", "#e39832"],
  ["ETH", "Ethereum", "#6579ce"],
  ["SOL", "Solana", "#7f63c5"],
  ["USDC", "USD Coin", "#367cba"],
  ["XRP", "XRP", "#4b647b"],
  ["ADA", "Cardano", "#316bd1"],
  ["DOGE", "Dogecoin", "#ad872b"],
  ["AVAX", "Avalanche", "#ce5858"],
  ["LINK", "Chainlink", "#4d6edb"],
  ["DOT", "Polkadot", "#ba4c87"],
  ["LTC", "Litecoin", "#6d7b91"],
  ["BCH", "Bitcoin Cash", "#418461"],
] as const;
export type CoinSymbol = (typeof coins)[number][0];
export type Purchase = {
  id: string;
  symbol: CoinSymbol;
  quantity: number;
  price: number;
  fee: number;
  date: string;
  note: string;
};
export type Quote = { price: number; change: number | null };
export type Market = {
  quotes: Partial<Record<CoinSymbol, Quote>>;
  fetchedAt: string;
  source: string;
};
export type Snapshot = { date: string; value: number; cost: number };
export type Portfolio = {
  version: 1;
  purchases: Purchase[];
  snapshots: Snapshot[];
};
export const emptyPortfolio = (): Portfolio => ({
  version: 1,
  purchases: [],
  snapshots: [],
});
export const today = () => new Date().toLocaleDateString("en-CA");
export function validatePurchase(value: Purchase): Purchase {
  if (
    !value ||
    !coins.some(([symbol]) => symbol === value.symbol) ||
    typeof value.id !== "string" ||
    !value.id ||
    value.id.length > 100 ||
    !Number.isFinite(value.quantity) ||
    value.quantity <= 0 ||
    value.quantity > 1e12 ||
    !Number.isFinite(value.price) ||
    value.price < 0 ||
    value.price > 1e12 ||
    !Number.isFinite(value.fee) ||
    value.fee < 0 ||
    value.fee > 1e12 ||
    typeof value.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
    !Number.isFinite(Date.parse(value.date)) ||
    new Date(value.date).toISOString().slice(0, 10) !== value.date ||
    value.date > today() ||
    typeof value.note !== "string" ||
    value.note.length > 200
  )
    throw new Error("invalidPurchase");
  return {
    id: value.id,
    symbol: value.symbol,
    quantity: value.quantity,
    price: value.price,
    fee: value.fee,
    date: value.date,
    note: value.note,
  };
}
export function parsePortfolio(raw: string): Portfolio {
  const value = JSON.parse(raw);
  if (
    value?.version !== 1 ||
    !Array.isArray(value.purchases) ||
    value.purchases.length > 10000 ||
    !Array.isArray(value.snapshots) ||
    value.snapshots.length > 3660
  )
    throw new Error("invalidBackup");
  const purchases: Purchase[] = value.purchases.map(validatePurchase);
  if (new Set(purchases.map((p) => p.id)).size !== purchases.length)
    throw new Error("invalidBackup");
  const snapshots: Snapshot[] = value.snapshots.map((s: Snapshot) => {
    if (
      !s ||
      typeof s.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(s.date) ||
      !Number.isFinite(Date.parse(s.date)) ||
      new Date(s.date).toISOString().slice(0, 10) !== s.date ||
      s.date > today() ||
      !Number.isFinite(s.value) ||
      s.value < 0 ||
      !Number.isFinite(s.cost) ||
      s.cost < 0
    )
      throw new Error("invalidBackup");
    return { date: s.date, value: s.value, cost: s.cost };
  });
  if (new Set(snapshots.map((s) => s.date)).size !== snapshots.length)
    throw new Error("invalidBackup");
  return {
    version: 1,
    purchases,
    snapshots: snapshots.sort((a, b) => a.date.localeCompare(b.date)),
  };
}
export function calculatePortfolio(
  purchases: Purchase[],
  market: Market | null,
) {
  const positions = coins
    .flatMap(([symbol, name, color]) => {
      const entries = purchases.filter((p) => p.symbol === symbol);
      if (!entries.length) return [];
      const quantity = entries.reduce((sum, p) => sum + p.quantity, 0);
      const cost = entries.reduce(
        (sum, p) => sum + p.quantity * p.price + p.fee,
        0,
      );
      const quote = market?.quotes[symbol];
      const value = quote ? quantity * quote.price : null;
      const pnl = value === null ? null : value - cost;
      return [
        {
          symbol,
          name,
          color,
          quantity,
          cost,
          average: cost / quantity,
          price: quote?.price ?? null,
          value,
          pnl,
          roi: pnl !== null && cost > 0 ? (pnl / cost) * 100 : null,
        },
      ];
    })
    .sort((a, b) => (b.value ?? b.cost) - (a.value ?? a.cost));
  const cost = positions.reduce((sum, p) => sum + p.cost, 0);
  const complete = positions.every((p) => p.value !== null);
  const value = complete
    ? positions.reduce((sum, p) => sum + (p.value ?? 0), 0)
    : null;
  const pnl = value === null ? null : value - cost;
  return {
    positions,
    cost,
    value,
    pnl,
    roi: cost > 0 && pnl !== null ? (pnl / cost) * 100 : null,
  };
}
export function recordSnapshot(
  portfolio: Portfolio,
  market: Market,
): Portfolio {
  const totals = calculatePortfolio(portfolio.purchases, market);
  if (
    !portfolio.purchases.length ||
    totals.value === null ||
    Date.now() - Date.parse(market.fetchedAt) > 300000
  )
    return portfolio;
  const snapshot = { date: today(), value: totals.value, cost: totals.cost };
  const previous = portfolio.snapshots.find((s) => s.date === snapshot.date);
  if (previous?.value === snapshot.value && previous?.cost === snapshot.cost)
    return portfolio;
  return {
    ...portfolio,
    snapshots: [
      ...portfolio.snapshots.filter((s) => s.date !== snapshot.date),
      snapshot,
    ]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-3660),
  };
}
