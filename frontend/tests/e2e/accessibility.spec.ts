import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("core pages and purchase dialog have no serious accessibility violations", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("folio.language", "en"));
  await page.route("https://api.coinbase.com/**", (route) => route.abort());
  await page.route("https://api.kraken.com/**", (route) => route.abort());
  for (const width of [1440, 800, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Add purchase", exact: true })
    .first()
    .click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
