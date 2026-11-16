<h1 align="center">🗺️ Roadmap</h1>

<p align="center">
  <em>From an empty extension to a public Receipts with a measured matcher, a working check flow and a live demo.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/now-phase_1:_fixtures_and_eval-F59E0B?style=for-the-badge" alt="Now: Phase 1, fixtures and eval">
  <img src="https://img.shields.io/badge/stage-incubating-2ea44f?style=for-the-badge" alt="Stage: incubating">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs_home-6B7280?style=for-the-badge" alt="Back to docs"></a>
</p>

---

The Receipts roadmap routine works this file top to bottom, one item per run, as `roadmap/auto-`
PRs: it takes the first open item that isn't `🔒 Needs owner` (or up to six `small` ones),
builds it and ticks it. **Every item above
`## After public release` is a release gate.** Receipts goes public when all of them are ticked
and Mike says so. Ticking an item adds its line to the [changelog](CHANGELOG.md) and updates
any doc it made stale, in the same commit.

Markers: `- [ ]` open, `- [-]` claimed by a run in progress, `- [x]` done, `- [!]` blocked
(the reason follows on the line). `small` marks docs, config or assets a run can batch, up to
six per PR (untagged means a feature, one per run); `🔒 Needs owner` marks one only the owner can do.

The slices come from [product/build-plan.md](product/build-plan.md), which marks Slices 0 to 6
as the MVP. They are packed into three features above the line: the matcher with its eval
(Slices 0-1), the status policy and its precision gate (Slice 2), and the extension check flow
(Slices 3-4). Slice 5, the Pages demo, is the live-demo item in the release phase, and Slice 6
is the release phase's `small` items. Store submission waits until after release because it
costs money.

## 🔬 Phase 1: Real fixtures and measured accuracy

The plan has two early falsifiers, so the work that answers them comes first: whether real
Google pages can be captured at all (by 2026-11-13), then whether the matcher's flags are
precise enough to ship (by 2026-11-20). No extension code until both are known.

- [x] `small` **Five saved Google AI Overview pages.** Five or more real Google results pages that show an AI Overview, saved as HTML under `tests/fixtures/google/` with personal data stripped (no account name, no location beyond country), each with its query, locale and capture date in `tests/fixtures/google/README.md`, plus a one-page re-capture procedure. Verified by `ls tests/fixtures/google/*.html | wc -l` printing 5 or more and each file containing the overview's visible heading. If an unattended run can't capture them (Google blocks it or serves different markup), mark this `- [!]` with what happened: the build plan's falsifier says to drop the extension if this fails, and Mike can save the pages by hand instead. — done 2026-11-16: six pages saved by hand from desktop Chrome (Mars distance, adult sleep, adult exercise, ocean depth, Moon travel time, Earth's water), scrubbed of scripts, styles, account and location data, each with its query, locale and date in [`tests/fixtures/google/README.md`](../tests/fixtures/google/README.md) with the re-capture procedure. Automated capture (Playwright, scripted Chrome) still hits Google's "unusual traffic" page.
- [x] **Slices 0-1: matcher module and labeled eval.** Port the prototype's matcher to `src/matcher.js`, a dependency-free ES module exporting `score(claim, pageText) -> { status, passage, figures }` ([ADR-002](decisions/adr-002-shared-matcher-module.md)), with unit tests on its figure parser, sentence splitter and stemmer. Hand-build 40 or more claim/source pairs from saved public pages (not a crawl) as fixtures under `tests/fixtures/eval/`, each labeled `supported`, `partial`, `conflict` or `absent`, with the source page's URL and retrieval date. `npm run eval` scores every pair through the same module and prints precision, recall and false-positive rate per status as a Markdown table. CI runs the eval, and the README shows its current table. — done 2026-11-06: `src/matcher.js` written from the spec (the prototype's code isn't in the repo or workspace) with tests on its stemmer, sentence splitter and figure parser in `tests/matcher.test.js`; 50 labeled pairs from six saved NASA, CDC and NOAA pages in `tests/fixtures/eval/`; `npm run eval` in `scripts/eval.js`, run by CI; the table in the README, kept current by a test; the build copies the matcher into `dist/extension/`
- [x] **Slice 2: status policy and precision gate.** The matcher returns only `found`, `conflict`, `not located` or `unreachable`, with thresholds tuned on the eval set and a figure-conflict detector that reports the figure on each side. CI fails when overall flag precision drops under 0.5 or conflict precision under 0.6. If the gate can't be met by 2026-11-20, mark this item `- [!]` with the numbers: that is the decision memo's falsifier, and the plan falls back to library plus demo only, which Mike decides. — done 2026-11-09: thresholds in `src/matcher.js` tuned by a grid sweep on the eval (`FOUND_COVERAGE` 0.7, `CONFLICT_COVERAGE` 0.55; 42 of 50 right, up from 40); the gate in `scripts/eval.js` (`GATE`, `gateFailures`) fails `npm run eval` and CI under it, with tests in `tests/eval.test.js`; now flag precision 0.85, `conflict` precision 1.00. The four statuses and both-sides figures were already in from Slices 0-1

## 🧩 Phase 2: Extension check flow

- [!] **Slices 3-4: the check flow.** A content script on `https://www.google.com/search*` finds the overview by its visible heading, splits it into claims (6+ words, at most 15) and pairs each with its cited links, unwrapping `/url?q=` redirects; tests over every saved page extract the same claim/link pairs. The service worker fetches each cited page with `credentials: "omit"`, an 8 s timeout and a 600,000-character read cap, and scores it through `src/matcher.js`. The popup lists flagged claims first, shows each status with its passage and domain (and both figures on a `conflict`), says "no close passage found in the pages Google cited" for `not located`, says so and disables Check on a page with no overview, and copies a plain-text report. Host access (`https://*/*`) is optional and requested on the first Check; declining explains that nothing was checked. A test records every network request during a check on the fixtures and fails on any host that isn't a cited URL ([ADR-001](decisions/adr-001-local-only.md)). No page text reaches `innerHTML`. Permissions are only `storage`, the content script match and the optional host access. `npm run build` produces a `dist/extension/` that loads unpacked in Chrome and Edge. — blocked: needs the five saved Google pages above, which wait on the 2026-11-13 falsifier decision

## 🚦 Public release

- [x] `small` **CI.** `.github/workflows/ci.yml` runs `npm ci`, then `npm run lint`, `npm test` and `npm run build` on push to `main` and on every PR, with `permissions: contents: read`. — done 2026-11-01: shipped with the scaffold
- [x] `small` **Security.** `SECURITY.md` says how to report a vulnerability and what counts as one, including any request to a host that isn't a cited page. — done 2026-11-01: shipped with the scaffold
- [x] `small` **Demo shell.** `site/index.html` with the org source bar across the top and a "coming soon" body, and `site/favicon.svg`, the app icon in the shared dark-tile format. — done 2026-11-01: shipped with the scaffold
- [x] `small` **Secret scan.** `gitleaks git . --log-opts=--all` comes back clean on the full history. — done 2026-11-01: clean on the scaffold commit
- [x] `small` **README usage matches the code.** How to build and load the extension unpacked, what each status means, the accuracy table regenerated from `npm run eval`, and every command run against the real build and behaving as written. The README states the spec's Won't list plainly, so nobody files an issue asking for a "true/false" verdict, an LLM, or Bing support. — done 2026-11-13: README "Build and load it" (npm ci, npm run build, Load unpacked in Chrome or Edge, reload after a rebuild) and "Contributor checks" sections, each command run on this branch; the full Won't list from the spec under "What it won't do"; the status table and accuracy table were already current (`npm run eval -- --readme` leaves it unchanged). Slices 3-4 must update the usage once the popup exists
- [x] `small` **Privacy and permissions.** A README privacy statement that matches ADR-001 word for word in substance (nothing leaves the browser except fetches of the cited pages, logged out; no analytics, no key, no server) and a permissions table listing every permission in `src/extension/manifest.json` with why it's needed. A test fails if the manifest gains a permission the table doesn't list. — done 2026-11-13: README "Privacy" section and a permissions table between `permissions:` markers; the manifest asks for none yet, so the table lists the three the spec allows, each marked "Not yet (Slices 3-4)"; `tests/permissions.test.js` fails on any manifest permission, host permission or content script match the table lacks
- [x] `small` **Build stamp.** `<meta name="build" content="__BUILD_SHA__">` in `site/index.html`'s `<head>` — done 2026-11-13: in `site/index.html`, for the live-demo workflow to replace
- [ ] **Live demo at `https://ai-automation-tools.dev/receipts/`** (Slice 5). Paste a claim and its source text, click Check, and see the status and quoted passage from the same `src/matcher.js` the extension and the eval use, with no network call. Three canned examples, one click each (a `found`, a `conflict`, a `not located`), all built from public pages and holding no personal data. An `actions/deploy-pages` workflow publishes `site/` with the matcher copied in, replacing `__BUILD_SHA__` with `${{ github.sha }}` before the upload, and the page works offline after first load. The page keeps the source bar and app-icon favicon from the shell, is keyboard operable, never shows status by colour alone, and the README hero's Live Demo badge points at it.

## After public release

Nothing below blocks go-live.

### 🧩 Next slices

- [ ] **P1: Firefox build.** The same extension packaged for Firefox, with the network-recording test passing there too.
- [ ] **P4: live-markup canary.** A scheduled CI job loads a real Google results page and fails when the content script stops finding the overview. Only once Mike confirms it is allowed by Google's terms and by the sandbox the roadmap runs in. 🔒 Needs owner
- [ ] **P2: in-browser NLI tier.** Only if the eval shows lexical matching can't reach the precision gate on paraphrase, and only after ADR-001 is amended: opt-in, off by default, documented as a changed privacy statement.
- [ ] **P3: other surfaces.** Perplexity, then Bing Copilot, each behind its own saved fixtures and the same network test.
- [ ] `small` **Keyboard shortcut (C1).** One shortcut runs Check on the current tab, listed in the README.
- [ ] **In-page badges (C2).** A status badge placed next to each claim in the overview itself, built with DOM methods, never `innerHTML`.

### 📣 Publish and promote

- [ ] `small` **Store listing kit.** `npm run package` writes a zip of `dist/extension/`; store listing text and three screenshots of the popup on the saved fixtures live in `docs/store/`.
- [ ] Chrome Web Store developer account and submission (one-time fee, reported as $5). 🔒 Needs owner
- [ ] Edge Add-ons submission. 🔒 Needs owner
- [ ] Launch posts: Show HN, GEO and SEO communities, and a note to the WashU audit's authors. 🔒 Needs owner
- [ ] Custom subdomain `receipts-demo.ai-automation-tools.dev`. 🔒 Needs owner
- [ ] On 2027-03-31, run the stop test from the decision memo: under 100 installs and under 50 GitHub stars combined means stop feature work and keep the repo in maintenance only. 🔒 Needs owner

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="CHANGELOG.md">Changelog →</a>
</p>
