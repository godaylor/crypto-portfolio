import { test, expect } from "@playwright/test";

test("fresh cached quote is available while the provider refresh is pending", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("folio.language", "en");
    localStorage.setItem(
      "folio.market.v1",
      JSON.stringify({
        source: "Coinbase",
        fetchedAt: new Date().toISOString(),
        quotes: { ETH: { price: 2500, change: null } },
      }),
    );
  });
  let release!: () => void;
  const waiting = new Promise<void>((r) => {
    release = r;
  });
  await page.route("https://api.coinbase.com/**", async (r) => {
    await waiting;
    await r.abort();
  });
  await page.route("https://api.kraken.com/**", (r) => r.abort());
  await page.goto("/#markets");
  await page
    .locator(".market-card")
    .filter({ hasText: "Ethereum" })
    .getByRole("button")
    .click();
  await expect(page.getByLabel("Coin", { exact: true })).toHaveValue("ETH");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("2500");
  await page.getByLabel("Price per coin · USD").fill("2300");
  release();
  await expect(page.locator(".quote-hint")).toContainText("No fresh quote");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("2300");
});

test("market purchase inherits ETH and its editable quote independently", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("folio.language", "en"));
  await page.route("https://api.coinbase.com/**", (r) =>
    r.fulfill({
      json: {
        data: {
          currency: "USD",
          rates: Object.fromEntries(
            [
              "BTC",
              "ETH",
              "SOL",
              "USDC",
              "XRP",
              "ADA",
              "DOGE",
              "AVAX",
              "LINK",
              "DOT",
              "LTC",
              "BCH",
            ].map((s) => [s, s === "BTC" ? "0.00002" : "0.01"]),
          ),
        },
      },
    }),
  );
  await page.goto("/#markets");
  await expect(page.locator(".price-status")).toContainText("Coinbase");
  await page
    .locator(".market-card")
    .filter({ hasText: "Ethereum" })
    .getByRole("button")
    .click();
  await expect(page.getByLabel("Coin", { exact: true })).toHaveValue("ETH");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("100");
  await page.getByLabel("Price per coin · USD").fill("80,5");
  await page.getByLabel("Quantity", { exact: true }).fill("2,5");
  await page.getByLabel("Fee · USD").fill("1,25");
  await page.getByLabel("Purchase date").fill("2026-01-01");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("80,5");
  await expect(page.locator(".form-total")).toContainText("$202.50");
  await page
    .getByRole("button", { name: "Save purchase", exact: true })
    .click();
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("folio.portfolio.v1")!),
  );
  expect(saved.purchases).toHaveLength(1);
  expect(saved.purchases[0]).toMatchObject({
    symbol: "ETH",
    quantity: 2.5,
    price: 80.5,
    fee: 1.25,
    date: "2026-01-01",
  });
});

test("late quote never overwrites the selected coin, manual price or date", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("folio.language", "en"));
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://api.coinbase.com/**", async (r) => {
    await waiting;
    await r.fulfill({
      json: {
        data: {
          currency: "USD",
          rates: Object.fromEntries(
            [
              "BTC",
              "ETH",
              "SOL",
              "USDC",
              "XRP",
              "ADA",
              "DOGE",
              "AVAX",
              "LINK",
              "DOT",
              "LTC",
              "BCH",
            ].map((s) => [s, s === "BTC" ? "0.00002" : "0.01"]),
          ),
        },
      },
    });
  });
  await page.goto("/#markets");
  await page
    .locator(".market-card")
    .filter({ hasText: "Ethereum" })
    .getByRole("button")
    .click();
  await expect(page.getByLabel("Coin", { exact: true })).toHaveValue("ETH");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("");
  await page.getByLabel("Coin", { exact: true }).selectOption("SOL");
  await page.getByLabel("Price per coin · USD").fill("88,25");
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByLabel("Purchase date").fill("2026-01-01");
  release();
  await expect(
    page.getByRole("button", { name: "Use current quote" }),
  ).toBeVisible();
  await expect(page.getByLabel("Coin", { exact: true })).toHaveValue("SOL");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("88,25");
  await expect(page.getByLabel("Purchase date")).toHaveValue("2026-01-01");
  await page.getByRole("button", { name: "Use current quote" }).click();
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("100");
  await page.getByLabel("Coin", { exact: true }).selectOption("BTC");
  await expect(page.getByLabel("Price per coin · USD")).toHaveValue("50000");
  // Two synchronous submit events reproduce a double activation before React unmounts.
  await page.locator("form").evaluate((form) => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
  const purchases = await page.evaluate(
    () => JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases,
  );
  expect(purchases).toHaveLength(1);
  expect(purchases[0]).toMatchObject({
    symbol: "BTC",
    quantity: 2,
    price: 50000,
  });
  await page.locator('nav a[href="#assets"]').click();
  await expect(page.locator("tbody")).toContainText("Bitcoin");
  await page.locator('nav a[href="#overview"]').click();
  await expect(page.locator(".stat.featured strong")).toHaveText("$100,000.00");
});

for (const cached of [false, true])
  test(`unavailable quotes allow manual input, stale cache=${cached}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ cached }) => {
        localStorage.setItem("folio.language", "en");
        if (cached)
          localStorage.setItem(
            "folio.market.v1",
            JSON.stringify({
              source: "Coinbase",
              fetchedAt: new Date(Date.now() - 600000).toISOString(),
              quotes: { ETH: { price: 2500, change: null } },
            }),
          );
      },
      { cached },
    );
    await page.route("https://api.coinbase.com/**", (r) => r.abort());
    await page.route("https://api.kraken.com/**", (r) => r.abort());
    await page.goto("/#markets");
    await expect(page.locator(".banner")).toBeVisible();
    await page
      .locator(".market-card")
      .filter({ hasText: "Ethereum" })
      .getByRole("button")
      .click();
    await expect(page.getByLabel("Price per coin · USD")).toHaveValue("");
    await expect(page.locator(".quote-hint")).toContainText("No fresh quote");
    await expect(
      page.getByRole("button", { name: "Use current quote" }),
    ).toHaveCount(0);
    await page.getByLabel("Price per coin · USD").fill("20.5");
    await page.getByLabel("Quantity", { exact: true }).fill("1.5");
    await page
      .getByRole("button", { name: "Save purchase", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases[0],
      ),
    ).toMatchObject({ symbol: "ETH", price: 20.5, quantity: 1.5 });
  });
