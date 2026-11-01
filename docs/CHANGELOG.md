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
