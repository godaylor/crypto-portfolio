import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("folio.language"))
      localStorage.setItem("folio.language", "en");
  });
  await page.route("https://api.coinbase.com/**", (route) =>
    route.fulfill({
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
  await page.goto("/");
});
test("purchase → value → edit → reload → delete → undo → backup", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Make your portfolio yours." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add purchase", exact: true })
    .first()
    .click();
  await page.getByLabel("Quantity", { exact: true }).fill("0.5");
  await page.getByLabel("Price per coin · USD").fill("40000");
  await page.getByLabel("Fee · USD").fill("10");
  await page.getByRole("button", { name: "Save purchase" }).click();
  await expect(page.locator(".stat.featured strong")).toHaveText("$25,000.00");
  await expect(
    page.locator(".stats .stat").nth(1).locator("strong"),
  ).toHaveText("$20,010.00");
  await page.reload();
  await expect(page.locator(".stat.featured strong")).toHaveText("$25,000.00");
  await page
    .getByRole("link", { name: "Purchases", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Edit purchase BTC" }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Save purchase" }).click();
  await expect(
    page.getByRole("cell", { name: "$40,010.00", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete BTC" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make your portfolio yours." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "$40,010.00", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Your data" }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/^folio-.*\.json$/);
  await page.locator("input[type=file]").setInputFiles({
    name: "folio.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, purchases: [], snapshots: [] }),
    ),
  });
  await page.getByRole("button", { name: "Replace with backup" }).click();
  await page.getByRole("link", { name: "Overview" }).click();
  await expect(
    page.getByRole("heading", { name: "Make your portfolio yours." }),
  ).toBeVisible();
});
test("market failure, cached data and invalid imports stay honest", async ({
  page,
}) => {
  await expect(page.locator(".price-status")).toContainText("Coinbase");
  await page.route("https://api.coinbase.com/**", (route) => route.abort());
  await page.route("https://api.kraken.com/**", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByText(
      "Cached prices — last refresh failed or prices are over 5 minutes old.",
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Your data" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad}"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "not a valid Folio backup",
  );
});
test("mobile Russian UI fits viewport and keyboard closes purchase form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Language").selectOption("ru");
  await expect(
    page.getByRole("heading", { name: "Мой портфель", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Добавить покупку", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Рынок", exact: true }).click();
  await page.getByRole("searchbox").fill("bitcoin");
  await expect(page.locator(".market-card")).toHaveCount(2);
});
