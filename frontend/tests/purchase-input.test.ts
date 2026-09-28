import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decimal,
  decimalInput,
  freshQuote,
  quoteInput,
} from "../src/purchase-input";
import type { Market } from "../src/domain";

test("purchase decimals accept comma/dot but never blank or partial invalid input", () => {
  assert.equal(quoteInput(1 / 0.00002), "50000");
  assert.equal(quoteInput(0.00000001), "0.00000001");
  assert.equal(quoteInput(null), "");
  for (const value of [1e-12, 1e-8, 12345.123456789, 1e12])
    assert.equal(decimal(decimalInput(value)), value);
  for (const [input, expected] of [
    ["2,5", 2.5],
    [" 0.125 ", 0.125],
    [".5", 0.5],
    ["0", 0],
    ["1.", 1],
  ] as const)
    assert.equal(decimal(input), expected);
  for (const input of ["", " ", "-1", "1,2,3", "1.2abc", "1e3", "Infinity"])
    assert.ok(Number.isNaN(decimal(input)));
});
test("purchase quote requires a fresh valid price for exactly the selected coin", () => {
  const market: Market = {
    source: "QA",
    fetchedAt: new Date().toISOString(),
    quotes: {
      BTC: { price: 70000, change: null },
      ETH: { price: 2000, change: null },
    },
  };
  assert.equal(freshQuote(market, "ETH", false), 2000);
  assert.equal(freshQuote(market, "SOL", false), null);
  assert.equal(freshQuote(market, "ETH", true), null);
  assert.equal(freshQuote(null, "ETH", false), null);
  for (const fetchedAt of [
    "invalid",
    new Date(Date.now() - 300001).toISOString(),
    new Date(Date.now() + 120000).toISOString(),
  ])
    assert.equal(freshQuote({ ...market, fetchedAt }, "ETH", false), null);
  for (const price of [0, -1, NaN, Infinity])
    assert.equal(
      freshQuote(
        { ...market, quotes: { ETH: { price, change: null } } },
        "ETH",
        false,
      ),
      null,
    );
});
