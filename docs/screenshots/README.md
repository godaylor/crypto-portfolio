# Screenshots

Captured from the working application using real provider responses and three
explicit QA purchases. No user holdings, fabricated chart history or mock
market quotes are included. The application starts empty for new visitors.

- `portfolio-desktop.png`: overview, valuation, P&L, allocation, holdings.
- `first-run-desktop.png`: honest first-run onboarding and empty portfolio.
- `purchases-desktop.png`: editable purchase ledger with quantity and fees.
- `market-desktop.png`: supported coins and current indicative quotes.
- `portfolio-mobile-ru.png`: Russian responsive portfolio (full page).
- `purchase-form-mobile-ru.png`: Russian mobile purchase form.

Reproduce with `FOLIO_LIVE_QA=1 npm run e2e -- live.spec.ts` while a preview
is running. These captures are QA artifacts, not proof of public deployment;
see PORTFOLIO_HANDOFF.md for production verification.
