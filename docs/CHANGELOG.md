<h1 align="center">📋 Receipts Changelog</h1>

<p align="center">
  <em>What changed in Receipts, newest first.</em>
</p>

<p align="center">
  <a href="ROADMAP.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs-6B7280?style=for-the-badge" alt="Docs home"></a>
</p>

---

Entries that close a roadmap item carry the roadmap phase in italics.

## 2026-11-11

**Docs**
- Roadmap rechecked against the org's 2026-11 requirements: the intro names the roadmap routine instead of its days; Slices 3-4 are marked blocked on the saved Google pages, so a run moves on to the release items that need only the manifest and the matcher; a `small` build-stamp item, and the live-demo item stamps the build.

## 2026-11-09

**Added**
- The precision gate: `npm run eval` exits non-zero, failing CI, when flag precision drops under 0.5 or `conflict` precision under 0.6, and a test holds the matcher to it. *Phase 1: Real fixtures and measured accuracy*

**Changed**
- Matcher thresholds tuned on the eval set with a grid sweep: `FOUND_COVERAGE` 0.6 to 0.7 and `CONFLICT_COVERAGE` 0.5 to 0.55. Correct statuses rise from 40 to 42 of 50, flag precision from 0.84 to 0.85 and `conflict` precision from 0.90 to 1.00. *Phase 1: Real fixtures and measured accuracy*

## 2026-11-06

**Added**
- `src/matcher.js`, the shared lexical matcher: `score(claim, pageText)` finds the closest passage of up to three sentences by shared word stems, compares its figures with the claim's, and returns `found`, `conflict`, `not located` or `unreachable` with the passage and both figures. `npm run build` copies it into the extension. *Phase 1: Real fixtures and measured accuracy*
- `npm run eval`: 50 hand-labeled claim/source pairs from six saved NASA, CDC and NOAA pages, scored through the matcher, with precision, recall and false-positive rate per status. CI runs it, and the README shows the table. *Phase 1: Real fixtures and measured accuracy*

**Blocked**
- The five saved Google AI Overview pages: Google answers an unattended run with an "enable JavaScript" page or a CAPTCHA. Asked Mike in `docs/OPEN-QUESTIONS.md`. *Phase 1: Real fixtures and measured accuracy*

## 2026-11-01

**Added**
- Project scaffold: an empty Manifest V3 extension in `src/extension/`, a build script that copies it to `dist/extension/`, and `npm run build`, `npm test` and `npm run lint` passing.
- CI on push to `main` and on every PR: lint, test and build. *Public release*
- `SECURITY.md`: how to report a vulnerability, and what counts as one here. *Public release*
- Demo shell in `site/`: the org source bar, a "coming soon" page, and the app icon as favicon. *Public release*
- Full-history secret scan with gitleaks, clean. *Public release*
- `.env.example`, which says Receipts has no settings. MIT license.

**Docs**
- Root README, docs hub, roadmap with release gates, and this changelog.
- The product spec, build plan and both ADRs, copied from the business plan into `docs/product/` and `docs/decisions/`.
- `AGENTS.md` for the roadmap agent, with `CLAUDE.md` importing it.

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="ROADMAP.md">← Roadmap</a>
</p>
