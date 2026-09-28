import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const screenshots = process.env.FOLIO_QA_DIR || "../qa-browser-smoke/themes";

const ids = [
  "premium-dark",
  "apple-light",
  "blue-fintech",
  "dark-glass",
  "light-glass",
  "ios-glass",
  "mocha-code",
  "chatgpt-dark",
  "graphite",
];
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
async function quotes(page: Page) {
  await page.route("https://api.coinbase.com/**", (r) =>
    r.fulfill({
      json: {
        data: {
          currency: "USD",
          rates: Object.fromEntries(
            symbols.map((s, i) => [
              s,
              1 / (i === 0 ? 72000 : i === 1 ? 2800 : 100 + i),
            ]),
          ),
        },
      },
    }),
  );
}
async function seed(page: Page, theme: string) {
  await page.addInitScript(
    ({ theme }) => {
      if (localStorage.getItem("qa-seeded")) return;
      localStorage.setItem("qa-seeded", "1");
      localStorage.setItem("crypto-portfolio-theme", theme);
      const date = new Date().toLocaleDateString("en-CA");
      const purchases = [
        {
          id: "qa-btc",
          symbol: "BTC",
          quantity: 0.15,
          price: 65000,
          fee: 12,
          date,
          note: "Тестовая покупка QA",
        },
        {
          id: "qa-eth",
          symbol: "ETH",
          quantity: 2.5,
          price: 3100,
          fee: 8,
          date,
          note: "QA",
        },
        {
          id: "qa-sol",
          symbol: "SOL",
          quantity: 12,
          price: 100,
          fee: 3,
          date,
          note: "QA",
        },
      ];
      const snapshots = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (7 - i));
        return {
          date: d.toLocaleDateString("en-CA"),
          value: 18000 + i * 250,
          cost: 18723,
        };
      });
      localStorage.setItem(
        "folio.portfolio.v1",
        JSON.stringify({ version: 1, purchases, snapshots }),
      );
    },
    { theme },
  );
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
async function axe(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
}
for (const theme of ids)
  test(`${theme}: screens, dialog, errors, persistence and contrast`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await seed(page, theme);
    await quotes(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto("/");
    await expect(page.locator(".price-status")).toContainText("Coinbase");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const before = await page.evaluate(
      () => JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases,
    );
    fs.mkdirSync(screenshots, { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1050 });
      for (const hash of [
        "overview",
        "assets",
        "markets",
        "purchases",
        "appearance",
        "settings",
      ]) {
        await page.locator(`nav a[href="#${hash}"]`).click();
        await noOverflow(page);
        if (hash === "overview")
          await expect(page.locator(".history-chart")).toBeVisible();
        await page.screenshot({
          path: `${screenshots}/${theme}-${width}-${hash}.png`,
          fullPage: true,
        });
        await axe(page);
      }
      await page.locator('nav a[href="#markets"]').click();
      await page
        .locator(".market-card")
        .filter({ hasText: "Ethereum" })
        .getByRole("button")
        .click();
      await page.getByLabel("Количество", { exact: true }).fill("1,5");
      await page.getByLabel("Цена за монету · USD").fill("2500");
      await page
        .getByLabel("Заметка (необязательно)")
        .fill("Тестовая покупка QA");
      const dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("Тема", { exact: true })
        .selectOption(ids[(ids.indexOf(theme) + 1) % ids.length]);
      await expect(page.getByLabel("Количество", { exact: true })).toHaveValue(
        "1,5",
      );
      await dialog.getByLabel("Тема", { exact: true }).selectOption(theme);
      await page.screenshot({
        path: `${screenshots}/${theme}-${width}-form.png`,
        fullPage: true,
      });
      await axe(page);
      await page.getByLabel("Количество", { exact: true }).fill("-2");
      await dialog
        .getByRole("button", { name: "Сохранить покупку", exact: true })
        .click();
      await expect(dialog.getByRole("alert")).toBeVisible();
      await axe(page);
      await page.screenshot({
        path: `${screenshots}/${theme}-${width}-error.png`,
      });
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(
        page
          .locator(".market-card")
          .filter({ hasText: "Ethereum" })
          .getByRole("button"),
      ).toBeFocused();
    }
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("folio.portfolio.v1")!).purchases,
      ),
    ).toEqual(before);
    await page.route("https://api.coinbase.com/**", (r) => r.abort());
    await page.route("https://api.kraken.com/**", (r) => r.abort());
    await page.reload();
    await expect(
      page.getByText("Цены из кэша:", { exact: false }),
    ).toBeVisible();
    await axe(page);
    expect(errors).toEqual([]);
  });

test("responsive bounds, history navigation, language and reduced motion", async ({
  page,
}) => {
  test.setTimeout(120000);
  await seed(page, "dark-glass");
  await quotes(page);
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [
    320, 360, 390, 430, 649, 650, 651, 768, 949, 950, 951, 1024, 1199, 1200,
    1201, 1280, 1440, 1920, 2560, 3840, 5120, 7680,
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const hash of [
      "overview",
      "assets",
      "markets",
      "purchases",
      "appearance",
    ]) {
      await page.locator(`nav a[href="#${hash}"]`).click();
      await noOverflow(page);
    }
  }
  await page.setViewportSize({ width: 640, height: 450 });
  await page.locator('nav a[href="#markets"]').click();
  await noOverflow(page);
  await page.locator('nav a[href="#assets"]').click();
  await page.goBack();
  await expect(page).toHaveURL(/#markets$/);
  await page.goForward();
  await expect(page).toHaveURL(/#assets$/);
  await page.getByLabel("Язык").selectOption("en");
  await page.reload();
  await expect(page.getByLabel("Language")).toHaveValue("en");
});

test("unreadable storage: themes work and existing data stays protected", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      value() {
        throw new Error("blocked");
      },
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new Error("blocked");
      },
    });
  });
  await quotes(page);
  await page.goto("/");
  await page.getByLabel("Тема", { exact: true }).selectOption("dark-glass");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark-glass",
  );
  await expect(
    page.getByText("Тема действует до закрытия страницы:", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Добавить покупку", exact: true }).first(),
  ).toBeDisabled();
});

test("failed storage write keeps the purchase form and reports the error", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new Error("quota");
      },
    }),
  );
  await quotes(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить покупку", exact: true })
    .first()
    .click();
  await page.getByLabel("Количество", { exact: true }).fill("1");
  await page.getByLabel("Цена за монету · USD").fill("100");
  await page
    .getByRole("button", { name: "Сохранить покупку", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
});
