# Folio release status — 2026-09-12

## Released and verified

- Public production: https://folio-crypto-godaylor.maxeemzhuparov.chatgpt.site
- Anonymous HTTP request returns 200 and the Folio document without an
  authorization header, cookie or sign-in session.
- Strict TypeScript and ESLint pass.
- Nine domain/provider tests pass: fees, weighted averages, missing quotes,
  zero cost, validation, backups, observations and provider fallback.
- Four deterministic browser scenarios pass: purchase/edit/reload/delete/undo/
  backup flow, cached failure handling, invalid import, Russian mobile UI and
  axe WCAG A/AA checks at 1440/800/390 widths plus the purchase dialog.
- Production build succeeds. Main JavaScript is approximately 181 kB raw /
  59 kB gzip, CSS approximately 25 kB raw / 8.5 kB gzip; fonts are self-hosted.
- npm audit reports zero vulnerabilities.
- Sites version 2 deployed successfully from source commit
  `e066a5fa52710015174f057fb68dfeb52de10aa1`.
- The seven legacy JS/JSX files listed in PROVENANCE.md have no active imports,
  were removed, and remain recoverable from commit `3d903cc`.
- LICENSE, THIRD_PARTY_NOTICES.md and packaged third-party license texts remain.
- GitHub contains the release source, CI, documentation and six sanitized QA
  screenshots. The remote workflow result is checked after publication.

No other PetProjects processes, containers, Docker networks or volumes were
modified. Local browser QA used a dedicated free port and only its own preview
process was stopped.

## Readiness

| Category | Score | Evidence |
| --- | ---: | --- |
| Concept | 95% | Independent manual holdings tracker with a clear scope |
| UX/UI | 94% | RU/EN, responsive views, real forms/states and tested accessibility |
| Core functionality | 96% | CRUD, quotes/fallback, P&L/ROI, allocation, observations and backups |
| Quality/security | 95% | Types, lint, tests, browser checks, production build and clean audit |
| Backend/data/auth | 92% | Deliberate local-only persistence; no server or account required |
| Public production | 96% | Public HTTPS release and anonymous response verified |
| GitHub/docs/licenses | 95% | Published source, QA evidence, CI, provenance and notices |
| Portfolio handoff | 96% | Public links, production evidence and six deployed screenshots |

Arithmetic mean: **94.875%** (759 ÷ 8), displayed rounded as **95%**.
