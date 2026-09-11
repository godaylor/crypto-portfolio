# Folio release status — 2026-09-11

## Verified

- Strict TypeScript and ESLint pass.
- Nine domain/provider tests pass: fees, weighted averages, missing quotes,
  zero cost, validation, backups, observations and provider fallback.
- Four deterministic browser scenarios pass: purchase/edit/reload/delete/undo/
  backup flow, cached failure handling, invalid import, Russian mobile UI and
  axe WCAG A/AA checks at 1440/800/390 widths plus the purchase dialog.
- Production build succeeds. Main JavaScript is approximately 181 kB raw /
  59 kB gzip, CSS approximately 25 kB raw / 8.5 kB gzip; fonts are self-hosted.
- npm audit reports zero vulnerabilities after compatible dependency updates.
- Sites version 1 reports `succeeded`; source commit is
  `4a48bb0a138b046643b5efdd9e60f20a09f8d7a7`.
- Live HTTPS browser check passed with real Coinbase quotes and existing private
  access: add three QA purchases, verify holdings, reload, open ledger/market,
  switch to RU and validate mobile width. Zero JavaScript page errors.
- Public/anonymous request returns HTTP 401. The release is intentionally still
  owner-only pending the separate approval request; no public success is claimed.

## Remaining release work

1. Confirm public access to Folio and publication of its code/QA screenshots in
   godaylor/crypto-portfolio. Automatic approval review rejected these mutations
   because it did not recognize authorization from the attached original brief.
2. After approval: open public access, verify an anonymous visitor's complete
   workflow, publish the GitHub release, run remote CI, update repository About,
   Website/topics, and reconcile local/remote main with a fast-forward.
3. Seven excluded legacy files remain because deletion approval was rejected;
   exact paths and licensing boundaries are in PROVENANCE.md. They are not
   bundled and are not covered by the new MIT grant.

No other PetProjects processes, containers, Docker networks or volumes were
modified. Only this project's development/test processes were started.

## Readiness (equal weights)

| Category | Score | Complete and verified | Remaining |
| --- | ---: | --- | --- |
| Concept | 95% | Independent manual holdings tracker; clear scope | Expand only from real user needs |
| UX/UI | 90% | RU/EN, responsive screens, real forms/states, tested contrast | Broader browser/device user testing |
| Core functionality | 94% | CRUD, quotes/fallback, P&L/ROI, allocation, observed history, backups | Longer observation history accumulates through usage |
| Quality/security | 92% | Types, lint, nine unit tests, four browser scenarios, live smoke, audit clean | Remote CI not yet executed; wider browser matrix |
| Backend/data/auth | 90% | Local persistence/backup architecture verified; no server/auth required | No cloud synchronization by design |
| Public production | 45% | Private hosted release and real network browser smoke pass | Public access and anonymous E2E blocked pending approval |
| GitHub/docs/licenses | 60% | Local commits, README, notices, provenance and CI configuration | GitHub publication/metadata/remote CI and excluded legacy cleanup |
| Portfolio handoff | 85% | Handoff and six real deployed screenshots | Final public URL status and GitHub synchronization |

Arithmetic mean: **81.375%** (651 ÷ 8), displayed rounded as **81%**.
