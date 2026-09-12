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
- Public access: enabled; no account is required.
- Hosted release: Sites production release, publicly reachable and verified on
  2026-09-12. The exact version and source commit are recorded in RELEASE_STATUS.md.
- Production verification: real HTTPS browser smoke passed using existing
  owner-only test access. Real quotes, three purchase lots, calculated holdings,
  reload persistence, purchases/market views, RU mobile layout and zero page
  errors verified. Screenshots below were recaptured on this hosted build.
- Anonymous access check: HTTP 200 without authorization headers, cookies or a
  sign-in session. The public browser scenario is rerun after each production publish.
- GitHub release: source, documentation, licensing files and six sanitized QA
  screenshots are published in `godaylor/crypto-portfolio`.
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
Seven historical JS/JSX files were removed after confirming that the production
module graph does not use them. Their rights are unverified, they remain excluded
from the MIT grant, and commit `3d903cc` preserves them for recovery.
See PROVENANCE.md and THIRD_PARTY_NOTICES.md for exact boundaries.

## Production claims

Public production works for the verified purchase-and-valuation flow above.
The product supports local-device persistence;
it does not substitute cloud sync or an imaginary historical chart.
