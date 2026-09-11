# Provenance and licensing boundary

## New Folio implementation

The active application was authored in this repository in September 2026 for
Maxeem (godaylor), with AI assistance. It implements the product behavior in new
TypeScript modules: `frontend/src/{main.tsx,App.tsx,domain.ts,market.ts,strings.ts}`
and new `styles.css`. It does not import historical JavaScript, Ant Design,
Chart.js, sample prices, tutorial context providers or design-lab components.

This is an implementation replacement, not an identifier-only rewrite:
the new domain model stores validated purchase lots and dated observations;
quotes use public providers; UI uses React, native HTML and original CSS/SVG.
The baseline was used to identify missing product behavior, not copied into
the new runtime. This is a documented engineering provenance statement, not
an independent legal certification or a claim that third-party React is ours.

## Historical source

Baseline: `40a3e83bf39ef828c1402f127ce003e2ee5c12b6`. The Git log attributes the
initial commit `08ae2c0` and subsequent work to Maxeem. This does not establish
the original tutorial/source license. The original snapshot contained no
project LICENSE or identifiable copyright/NOTICE headers in the inspected source.
No unsupported upstream attribution has been invented.

Most superseded files were removed from the current tree while remaining in
Git history. The following files remain untouched because local permission
review rejected their deletion; they are NOT in the production module graph:

- `frontend/src/App.jsx`
- `frontend/src/theme.js`
- `frontend/src/componets/ThemeSwitcher.jsx`
- `frontend/src/componets/layout/BrandLockup.jsx`
- `frontend/src/componets/layout/BrandMarks.jsx`
- `frontend/src/componets/layout/DashboardDesignLab.jsx`
- `frontend/src/componets/layout/DashboardV2.jsx`

Their rights remain unverified. The root MIT license explicitly excludes them
and historical versions. Do not reuse these files under the new license.
No history was rewritten or force-pushed; pre-existing branches are preserved.

## Media and dependencies

No inherited coin imagery, stock photos, external logos or template favicon
ships. Coin badges and the Folio favicon are simple original typographic marks.
DM Sans and Manrope are self-hosted OFL fonts via Fontsource; upstream license
texts are copied to `frontend/public/licenses/`. React and its runtime
dependencies retain their MIT license texts there as well.
See THIRD_PARTY_NOTICES.md for the installed dependency inventory.

UX references: [CoinStats manual portfolio workflow](https://help.coinstats.app/en/articles/3592645-how-to-add-transactions-to-your-manual-portfolio)
and [Delta crypto tracker](https://delta.app/en/crypto-tracker). They informed
workflow expectations only; no interface code, copy, screenshots or media was copied.
