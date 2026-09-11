import { test, expect } from '@playwright/test'
import fs from 'node:fs'
test('real market smoke and portfolio screenshots', async ({ page }) => {
  test.setTimeout(90000)
  test.skip(!process.env.FOLIO_LIVE_QA, 'Opt-in live provider check')
  if (process.env.FOLIO_PRIVATE_QA_TOKEN && process.env.FOLIO_TEST_URL) {
    const origin = new URL(process.env.FOLIO_TEST_URL).origin
    await page.route(`${origin}/**`, route => route.continue({ headers: {
      ...route.request().headers(),
      'OAI-Sites-Authorization': `Bearer ${process.env.FOLIO_PRIVATE_QA_TOKEN}`,
    } }))
  }
  fs.mkdirSync('../docs/screenshots', { recursive: true })
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto('/')
  await expect(page.locator('.price-status')).toContainText(/Coinbase|Kraken/, { timeout: 25000 })
  await page.screenshot({ path: '../docs/screenshots/first-run-desktop.png', fullPage: true })
  for (const entry of [{symbol:'BTC',quantity:'0.15',price:'65000',fee:'12'}, {symbol:'ETH',quantity:'2.5',price:'2200',fee:'8'}, {symbol:'SOL',quantity:'12',price:'100',fee:'3'}]) {
    await page.getByRole('button',{name:'Add purchase',exact:true}).first().click()
    await page.getByRole('combobox',{name:'Coin',exact:true}).selectOption(entry.symbol)
    await page.getByLabel('Quantity',{exact:true}).fill(entry.quantity)
    await page.getByLabel('Price per coin · USD').fill(entry.price)
    await page.getByLabel('Fee · USD').fill(entry.fee)
    await page.getByLabel('Note (optional)').fill('QA verification purchase')
    await page.getByRole('button',{name:'Save purchase',exact:true}).click()
  }
  await page.reload()
  await expect(page.locator('.price-status')).toContainText(/Coinbase|Kraken/, { timeout: 25000 })
  await expect(page.locator('.holdings tbody tr')).toHaveCount(3)
  await expect(page.locator('.stat.featured strong')).not.toHaveText('—')
  await page.screenshot({ path: '../docs/screenshots/portfolio-desktop.png', fullPage: true })
  await page.getByRole('link',{name:'Purchases',exact:true}).click()
  await page.screenshot({ path: '../docs/screenshots/purchases-desktop.png', fullPage: true })
  await page.getByRole('link',{name:'Market',exact:true}).click()
  await page.screenshot({ path: '../docs/screenshots/market-desktop.png', fullPage: true })
  await page.getByRole('link',{name:'Overview',exact:true}).click()
  await page.getByLabel('Language').selectOption('ru')
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '../docs/screenshots/portfolio-mobile-ru.png', fullPage: true })
  await page.getByRole('button',{name:'Добавить покупку',exact:true}).first().click()
  await page.screenshot({ path: '../docs/screenshots/purchase-form-mobile-ru.png', fullPage: true })
  expect(errors).toEqual([])
})
