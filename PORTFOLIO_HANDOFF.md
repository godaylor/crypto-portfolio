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
9. Nine persistent themes, including Dark/Light/iOS Glass, with reduced-motion
   and opaque fallbacks. Overview and full holdings have separate pages.
10. Market purchase coin/quote prefill, comma/dot input and protection against
    late quote overwrites and duplicate submissions.

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
- Current release, exact source/publication state and evidence:
  [RELEASE_STATUS.md](RELEASE_STATUS.md). It distinguishes local mocked scenarios
  from anonymous hosted verification and live provider checks.
- Source, tests, licensing and sanitized QA evidence belong to
  `godaylor/crypto-portfolio`; there is no portfolio data in the shipped bundle.

## Screenshots

Current theme lead: `docs/screenshots/themes/dark-glass-desktop.jpg`.
Three contact sheets in that directory compare all nine themes on desktop,
mobile and forms using controlled QA data. The six earlier live-provider images
in `docs/screenshots/` are dated separately in the release report.

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
