import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePortfolio,
  emptyPortfolio,
  parsePortfolio,
  recordSnapshot,
  today,
  validatePurchase,
  type Purchase,
  type Market,
} from "../src/domain.ts";
const purchase: Purchase = {
  id: "one",
  symbol: "BTC",
  quantity: 2,
  price: 100,
  fee: 10,
  date: "2025-01-01",
  note: "",
};
const market: Market = {
  source: "Coinbase",
  fetchedAt: new Date().toISOString(),
  quotes: { BTC: { price: 150, change: null } },
};
test("weighted average includes fees and multiple lots", () => {
  const result = calculatePortfolio(
    [purchase, { ...purchase, id: "two", quantity: 1, price: 200, fee: 0 }],
    market,
  );
  assert.equal(result.cost, 410);
  assert.equal(result.value, 450);
  assert.equal(result.pnl, 40);
  assert.equal(result.positions[0].average, 410 / 3);
  assert.equal(result.roi, (40 / 410) * 100);
});
test("missing quotes never become zero prices or misleading P&L", () => {
  const result = calculatePortfolio([purchase], null);
  assert.equal(result.value, null);
  assert.equal(result.pnl, null);
  assert.equal(result.roi, null);
});
test("zero cost has no fabricated ROI", () => {
  const result = calculatePortfolio(
    [{ ...purchase, price: 0, fee: 0 }],
    market,
  );
  assert.equal(result.pnl, 300);
  assert.equal(result.roi, null);
});
test("rejects invalid purchases and malformed backups", () => {
  for (const change of [
    { quantity: -1 },
    { quantity: Infinity },
    { quantity: 0 },
    { price: NaN },
    { fee: -1 },
    { date: "2099-01-01" },
    { date: "2025-02-30" },
    { symbol: "FAKE" },
  ])
    assert.throws(() =>
      validatePurchase({ ...purchase, ...change } as Purchase),
    );
  assert.throws(() =>
    parsePortfolio(
      JSON.stringify({
        version: 1,
        purchases: [purchase, purchase],
        snapshots: [],
      }),
    ),
  );
  assert.throws(() => parsePortfolio("{bad}"));
  assert.throws(() =>
    parsePortfolio(
      JSON.stringify({ version: 2, purchases: [], snapshots: [] }),
    ),
  );
});
test("backup roundtrip preserves purchases and notes without executable interpretation", () => {
  const value = {
    ...emptyPortfolio(),
    purchases: [{ ...purchase, note: "<script>alert(1)</script>" }],
  };
  assert.deepEqual(parsePortfolio(JSON.stringify(value)), value);
});
test("records one observed snapshot per day and retains earlier days", () => {
  const portfolio = {
    ...emptyPortfolio(),
    purchases: [purchase],
    snapshots: [{ date: "2025-01-01", value: 50, cost: 30 }],
  };
  const next = recordSnapshot(portfolio, market);
  assert.equal(next.snapshots.length, 2);
  assert.deepEqual(next.snapshots[1], { date: today(), value: 300, cost: 210 });
  assert.equal(recordSnapshot(next, market), next);
  assert.equal(
    recordSnapshot(next, { ...market, fetchedAt: "2020-01-01" }),
    next,
  );
});
