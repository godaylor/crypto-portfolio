import { coins, type Market, type CoinSymbol } from "./domain";
export const marketKey = "folio.market.v1";
export function readMarket(): Market | null {
  try {
    const value = JSON.parse(localStorage.getItem(marketKey) || "null");
    if (
      !value ||
      !["Coinbase", "Kraken"].includes(value.source) ||
      !Number.isFinite(Date.parse(value.fetchedAt)) ||
      Date.parse(value.fetchedAt) > Date.now() + 60000
    )
      return null;
    const quotes: Market["quotes"] = {};
    for (const [symbol] of coins) {
      const quote = value.quotes?.[symbol];
      if (Number.isFinite(quote?.price) && quote.price > 0)
        quotes[symbol] = {
          price: quote.price,
          change: Number.isFinite(quote.change) ? quote.change : null,
        };
    }
    return Object.keys(quotes).length ? { ...value, quotes } : null;
  } catch {
    return null;
  }
}
async function getJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
    credentials: "omit",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export async function fetchMarket(signal: AbortSignal): Promise<Market> {
  try {
    const result = await getJson(
      "https://api.coinbase.com/v2/exchange-rates?currency=USD",
      signal,
    );
    if (result.data?.currency !== "USD") throw new Error("Invalid currency");
    const quotes: Market["quotes"] = {};
    for (const [symbol] of coins) {
      const rate = Number(result.data.rates?.[symbol]);
      if (Number.isFinite(rate) && rate > 0)
        quotes[symbol] = { price: 1 / rate, change: null };
    }
    if (Object.keys(quotes).length !== coins.length)
      throw new Error("Incomplete quotes");
    return { quotes, fetchedAt: new Date().toISOString(), source: "Coinbase" };
  } catch (error) {
    if (signal.aborted) throw error;
    const pairs: Record<CoinSymbol, string> = {
      BTC: "XXBTZUSD",
      ETH: "XETHZUSD",
      SOL: "SOLUSD",
      USDC: "USDCUSD",
      XRP: "XXRPZUSD",
      ADA: "ADAUSD",
      DOGE: "XDGUSD",
      AVAX: "AVAXUSD",
      LINK: "LINKUSD",
      DOT: "DOTUSD",
      LTC: "XLTCZUSD",
      BCH: "BCHUSD",
    };
    const result = await getJson(
      `https://api.kraken.com/0/public/Ticker?pair=${Object.values(pairs).join(",")}`,
      signal,
    );
    if (result.error?.length) throw new Error("Market unavailable");
    const quotes: Market["quotes"] = {};
    for (const [symbol, pair] of Object.entries(pairs)) {
      const row =
        result.result?.[pair] ??
        (symbol === "DOGE" ? result.result?.XXDGZUSD : undefined);
      const price = Number(row?.c?.[0]);
      if (Number.isFinite(price) && price > 0)
        quotes[symbol as CoinSymbol] = { price, change: null };
    }
    if (Object.keys(quotes).length !== coins.length)
      throw new Error("Incomplete quotes");
    return { quotes, fetchedAt: new Date().toISOString(), source: "Kraken" };
  }
}
