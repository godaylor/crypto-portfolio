import test from "node:test";
import assert from "node:assert/strict";
import { fetchMarket } from "../src/market.ts";
import { coins } from "../src/domain.ts";
test("Coinbase inverse rates become positive USD quotes", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          currency: "USD",
          rates: Object.fromEntries(coins.map(([s]) => [s, "0.01"])),
        },
      }),
      { status: 200 },
    );
  try {
    const result = await fetchMarket(new AbortController().signal);
    assert.equal(result.source, "Coinbase");
    assert.equal(result.quotes.BTC?.price, 100);
  } finally {
    globalThis.fetch = original;
  }
});
test("failed Coinbase uses real Kraken response schema", async () => {
  const original = globalThis.fetch;
  const pairs = [
    "XXBTZUSD",
    "XETHZUSD",
    "SOLUSD",
    "USDCUSD",
    "XXRPZUSD",
    "ADAUSD",
    "XDGUSD",
    "AVAXUSD",
    "LINKUSD",
    "DOTUSD",
    "XLTCZUSD",
    "BCHUSD",
  ];
  globalThis.fetch = async (input) =>
    String(input).includes("coinbase")
      ? new Response("", { status: 429 })
      : new Response(
          JSON.stringify({
            error: [],
            result: Object.fromEntries(
              pairs.map((s) => [s, { c: ["123.45"] }]),
            ),
          }),
        );
  try {
    const result = await fetchMarket(new AbortController().signal);
    assert.equal(result.source, "Kraken");
    assert.equal(Object.keys(result.quotes).length, 12);
    assert.equal(result.quotes.DOGE?.price, 123.45);
  } finally {
    globalThis.fetch = original;
  }
});
test("two failed providers reject instead of inventing quotes", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 503 });
  try {
    await assert.rejects(fetchMarket(new AbortController().signal));
  } finally {
    globalThis.fetch = original;
  }
});
