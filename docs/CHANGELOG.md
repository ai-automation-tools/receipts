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

## 2026-11-25

**Changed**
- Upstream check: queued moving the workflows off Node 20 actions (a roadmap item), and recorded which rows of `docs/UPSTREAMS.md` were checked.

## 2026-11-24

**Added**
- `docs/UPSTREAMS.md`, the worklist for the biweekly upstream check (Google's results markup, the cited pages, the MV3 platform, Pages and Actions, dev dependencies), and `.github/dependabot.yml` (weekly npm and GitHub Actions, minor and patch grouped, majors ignored).

## 2026-11-23

**Added**
- The extension checks an AI Overview. On a Google results page the content script reads the overview by its heading and pairs its text with the links cited after it; the service worker splits it into claims, fetches each cited page logged out (8 s timeout, 600,000-character cap) and scores it with `src/matcher.js`; the popup asks for host access on the first Check, lists flagged claims first with the passage, domain and both figures on a `conflict`, says "no close passage found in the pages Google cited" for `not located`, disables Check on a page with no overview, and copies a plain-text report. Tests run the content script over all six saved Google pages, and fail on any request a check makes to a page the overview doesn't cite. `linkedom` joins the dev dependencies to parse the saved pages in tests. *Phase 2*

**Changed**
- The live demo is ticked: the Pages workflow runs on `main` and `https://receipts-demo.ai-automation-tools.dev/` serves the stamped build. *Public release*

## 2026-11-22

**Changed**
- The demo moved to `https://receipts-demo.ai-automation-tools.dev/` (Pages custom domain, HTTPS enforced); `ai-automation-tools.dev/receipts/` redirects there. README, `AGENTS.md` and the roadmap point at the new address, and the org landing page now has a Receipts card linking it. *(roadmap: Custom subdomain)*

## 2026-11-17

**Security**
- The six Google fixtures no longer carry the browser key Google embeds in its results pages (a placeholder replaces it), and a `.gitleaksignore` covers the copies in history. It was Google's key, not this project's.

## 2026-11-16

**Added**
- The paste-in demo in `site/`: paste a claim and its source, or pick one of three canned examples from public NASA and NOAA pages (`found`, `conflict`, `not located`), and see the status, the closest passage and both figures from the same `src/matcher.js`, with no network call, working offline after the first load. `npm run build` writes it to `dist/site/` with the matcher, and `.github/workflows/pages.yml` stamps the build SHA and publishes it to `https://ai-automation-tools.dev/receipts/`; the README hero links it. *Public release*
- Six saved Google AI Overview pages in `tests/fixtures/google/`, captured by hand and scrubbed of account and location data, with their queries, locale, dates and a re-capture procedure in its README. The 2026-11-13 falsifier is answered: real pages can be captured. *Phase 1*

## 2026-11-13

**Added**
- README privacy statement matching ADR-001 and a permissions table, with `tests/permissions.test.js` failing if the manifest asks for a permission the table doesn't list. *Public release*
- `<meta name="build" content="__BUILD_SHA__">` in the demo page's `<head>`, for the deploy workflow to stamp. *Public release*

**Docs**
- README usage matches the code: how to build and load the extension unpacked in Chrome or Edge, the contributor checks CI runs, and the spec's full Won't list. *Public release*

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
