import type { CoinSymbol, Market } from "./domain";

export function decimalInput(value: number): string {
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumSignificantDigits: 21,
  });
}

// Only quote suggestions are formatted; saved and manually entered prices stay intact.
export function quoteInput(value: number | null): string {
  return value === null
    ? ""
    : value.toLocaleString("en-US", {
        useGrouping: false,
        maximumSignificantDigits: 12,
      });
}

export function decimal(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(\.\d*)?$|^\.\d+$/.test(normalized) ? Number(normalized) : NaN;
}

export function freshQuote(
  market: Market | null,
  symbol: string,
  unavailable: boolean,
): number | null {
  if (!market || unavailable) return null;
  const age = Date.now() - Date.parse(market.fetchedAt);
  if (!Number.isFinite(age) || age < -60000 || age > 300000) return null;
  const price = market.quotes[symbol as CoinSymbol]?.price;
  return price !== undefined && Number.isFinite(price) && price > 0
    ? price
    : null;
}
