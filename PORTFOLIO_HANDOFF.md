# Folio — Portfolio handoff

## Product

**Name:** Folio
**Short description:** A private crypto portfolio tracker with live prices,
purchase accounting, allocation and portable backups.
**User problem:** Understand what your holdings are worth and how their value
compares with your actual cost, without connecting an exchange account.

## Contribution

Maxeem (godaylor), with AI assistance: independent React/TypeScript application,
domain calculations, real market adapters with fallback, storage and recovery,
RU/EN experience, responsive design, accessibility, tests, CI and hosting setup.
This is not a claim of authorship of React, tooling, fonts or historical code.

## Features

1. Add, edit and delete purchases, including fees, date and notes; undo deletion.
2. Real indicative USD quotes for 12 coins, with source/time and stale states.
3. Weighted average cost, current value, unrealized P&L and ROI.
4. Aggregated holdings and proportional allocation.
5. Actual daily observations and accessible history values; 7D/30D/all ranges.
6. Versioned browser persistence, cross-tab updates, corrupt-data protection.
7. Validated JSON backup/restore and CSV purchase exports.
8. English/Russian interface and keyboard/mobile accessibility.

## Actual stack and architecture

React 18.3.1, TypeScript 5.9.3, Vite 7.3.6, CSS, SVG, native HTML dialogs,
localStorage, Coinbase public exchange-rates API, Kraken public ticker API,
Fontsource DM Sans/Manrope, ESLint 9/typescript-eslint, tsx/Node tests,
Playwright 1.63, axe-core, Prettier, GitHub Actions, Sites static hosting.

The browser validates purchase lots, calculates holdings and persists a
versioned local portfolio. A market adapter caches fetched quotes and falls
back between providers. History contains actual observed daily valuations.
The static release needs no account, backend, database, secrets or paid service.
No cloud sync, historical backfill, sales accounting or trading is claimed.

## Links and release status

- GitHub: https://github.com/godaylor/crypto-portfolio
- Hosted URL: https://folio-crypto-godaylor.maxeemzhuparov.chatgpt.site
- Public access: pending explicit confirmation requested after automatic
  approval review did not recognize authorization in the attached task.
- Hosted release: Sites version 1, deployed successfully on 2026-09-11.
  Source commit: `4a48bb0a138b046643b5efdd9e60f20a09f8d7a7`.
- Production verification: real HTTPS browser smoke passed using existing
  owner-only test access. Real quotes, three purchase lots, calculated holdings,
  reload persistence, purchases/market views, RU mobile layout and zero page
  errors verified. Screenshots below were recaptured on this hosted build.
- Anonymous access check: HTTP 401, as expected for owner-only access. A public
  visitor scenario has NOT passed and must be rerun after public access approval.
- GitHub release: blocked by automatic approval review on the QA screenshot
  upload. The personal origin remains unchanged at the original main commit;
  local release commits and the private Sites source repository preserve all work.
- Local verification: typecheck, lint, 9 domain/provider tests, browser CRUD,
  persistence, backups, offline/error paths, mobile RU, and axe contrast checks.
- Dependency audit after compatible updates: 0 vulnerabilities.

## Screenshots

Best lead image: `docs/screenshots/portfolio-desktop.png`.
Also use `portfolio-mobile-ru.png`, `purchases-desktop.png`,
`market-desktop.png`, `first-run-desktop.png`, and `purchase-form-mobile-ru.png`
from that directory. These contain QA purchases and real fetched quotes.

## Licensing / provenance

New runtime: MIT. Fonts: SIL OFL 1.1. Runtime dependency notices ship with the
site. No inherited media or tutorial implementation is in the production graph.
Seven historical JS/JSX files remain untouched and explicitly excluded from
the MIT grant because deletion was blocked by local approval review. Their
rights are unverified. Git history and old branches are preserved.
See PROVENANCE.md and THIRD_PARTY_NOTICES.md for exact boundaries.

## Production claims

Private production works for the verified purchase-and-valuation flow above.
Do not label the project publicly released until anonymous access and browser
verification are complete. The product supports local-device persistence;
it does not substitute cloud sync or an imaginary historical chart.
