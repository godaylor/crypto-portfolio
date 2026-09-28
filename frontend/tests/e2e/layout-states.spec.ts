import { test, expect } from "@playwright/test";

for (const count of [0, 1, 2, 24])
  test(`short viewports, keyboard and ${count} purchases`, async ({ page }) => {
    await page.addInitScript(
      ({ count }) => {
        localStorage.setItem("folio.language", "en");
        localStorage.setItem("crypto-portfolio-theme", "dark-glass");
        const symbols = [
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
        ];
        localStorage.setItem(
          "folio.portfolio.v1",
          JSON.stringify({
            version: 1,
            snapshots: [],
            purchases: Array.from({ length: count }, (_, i) => ({
              id: `qa-${i}`,
              symbol: symbols[i % 12],
              quantity: 1e-8,
              price: 200,
              fee: 1e-8,
              date: "2026-01-01",
              note: "QA — длинная заметка для проверки / a long note for the layout check",
            })),
          }),
        );
      },
      { count },
    );
    await page.route("https://api.coinbase.com/**", (r) => r.abort());
    await page.route("https://api.kraken.com/**", (r) => r.abort());
    await page.goto("/");
    // Reflow equivalent to a 1280×900 viewport at 200% and 400% zoom.
    for (const [width, height] of [
      [640, 450],
      [320, 225],
    ]) {
      await page.setViewportSize({ width, height });
      for (const hash of [
        "overview",
        "assets",
        "purchases",
        "markets",
        "settings",
        "appearance",
      ]) {
        await page.locator(`nav a[href="#${hash}"]`).click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('nav a[href="#purchases"]').click();
    if (count) {
      await expect(page.locator("tbody tr")).toHaveCount(count);
      const original = await page.evaluate(
        () => JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases,
      );
      await page
        .getByRole("button", { name: "Edit purchase BTC", exact: true })
        .first()
        .click();
      await expect(page.getByLabel("Quantity", { exact: true })).toHaveValue(
        "0.00000001",
      );
      await page
        .getByRole("button", { name: "Save purchase", exact: true })
        .click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases,
      );
      expect(
        saved.sort((a: { id: string }, b: { id: string }) =>
          a.id.localeCompare(b.id),
        ),
      ).toEqual(
        original.sort((a: { id: string }, b: { id: string }) =>
          a.id.localeCompare(b.id),
        ),
      );
    }
    const trigger = page
      .getByRole("button", { name: "Add purchase", exact: true })
      .first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Quantity", { exact: true })).toBeFocused();
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() => !!document.activeElement?.closest("dialog")),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => getComputedStyle(document.activeElement!).outlineStyle,
        ),
      ).not.toBe("none");
    }
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

test("reduced transparency uses opaque panels without changing the selected theme", async ({
  page,
  browserName,
  context,
}) => {
  test.skip(
    browserName !== "chromium",
    "Chromium CDP media emulation; fallback CSS is shared",
  );
  await page.addInitScript(() =>
    localStorage.setItem("crypto-portfolio-theme", "dark-glass"),
  );
  await page.route("https://api.coinbase.com/**", (r) => r.abort());
  await page.route("https://api.kraken.com/**", (r) => r.abort());
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-transparency", value: "reduce" },
      { name: "prefers-reduced-motion", value: "reduce" },
    ],
  });
  await page.goto("/");
  expect(
    await page
      .locator(".panel")
      .first()
      .evaluate((el) => getComputedStyle(el).backdropFilter),
  ).toBe("none");
  expect(
    await page
      .locator(".panel")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(21, 28, 48)");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark-glass",
  );
});
