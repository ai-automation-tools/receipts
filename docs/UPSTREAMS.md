# Upstreams

Every external service, platform and tool Receipts depends on, what the code assumes about
each, and where to check whether that assumption still holds. The biweekly **Receipts Upstream
Check** routine (`upstream/auto-*` PRs) works from this file. Keep it current by hand too: a new
outbound call or a new platform feature is a new row.

Receipts has no server, no API key and no runtime dependency; the extension and the demo are
plain JavaScript. Its only live inputs are Google's results page, the pages Google cites, and the
browser and hosting platforms below.

**Last checked** is filled in by the routine, and only with a date it actually read the
source. `—` means never checked.

## Google and the cited pages

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Google results page markup** *(unofficial, undocumented, changes without notice)* | The content script runs on `https://www.google.com/search*`. It finds the AI Overview by an element with `role="heading"` whose text is exactly `AI Overview`, then walks up to the closest ancestor holding a citation link, and reads its answer column from `[data-container-id="main-col"]` when present. Citation chips sit in `aria-hidden` spans. The query is `location.search` `q` | `src/extension/content.js`, `tests/fixtures/google/`, `tests/extension.test.js` | No official docs. Compare a live results page with the saved fixtures (the README warns users to open an issue when Check says a page with an overview has none); the live-markup canary is a 🔒 Needs owner roadmap item | — |
| **Google outbound link format** | Cited links are `/url?q=<target>` or `/url?url=<target>` on a `google.*` host, unwrapped to the target; `http(s)` links on non-Google hosts pass through; Google's own links are skipped | `src/extension/content.js` (`citedUrl`), `src/extension/background.js` | A live results page's citation anchors, against `tests/fixtures/google/claims.json` | — |
| **Cited pages (any public site)** | Fetched once each, `GET`, `credentials: "omit"`, `referrerPolicy: "no-referrer"`, 8 s timeout, 600,000-character read cap, accepted only when the answer is 2xx with `text/html`, `text/plain` or `application/xhtml+xml`; decoded as UTF-8. `http://` pages are `unreachable` because the optional host permission covers `https://*/*` only | `src/extension/background.js` (`fetchPage`) | No single source. The README's permissions table and ADR-001 are the contract; check whether common sites now block logged-out fetches by user agent | — |

## Browsers

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Chrome extensions platform (Manifest V3)** | `manifest_version: 3`; `background.service_worker` with `type: "module"`; a classic `content_scripts` script (not an ES module) with `run_at: "document_idle"`; `optional_host_permissions: ["https://*/*"]` requested from the popup on the first Check; `action.default_popup`. Built output loads unpacked from `dist/extension/` | `src/extension/manifest.json`, `src/extension/background.js`, `src/extension/popup.js`, `scripts/build.js` | developer.chrome.com/docs/extensions (MV3 reference and the What's new page) | 2026-11-25 |
| **Microsoft Edge extensions** | The same unpacked MV3 build loads in Edge via `edge://extensions`; the check flow was loaded in headless Edge (roadmap, 2026-11-23) | `README.md` (Build and load it) | learn.microsoft.com/microsoft-edge/extensions (MV3 and manifest differences) | 2026-11-25 |

## Demo hosting and CI

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **GitHub Pages (workflow build)** | `dist/site/` is uploaded with `actions/upload-pages-artifact@v3` and published with `actions/deploy-pages@v4` (current: v5 and v5, Node 24) from `main`; the `github-pages` environment and `pages: write` / `id-token: write` permissions; custom domain `receipts-demo.ai-automation-tools.dev` set in Pages settings, not in a `CNAME` file | `.github/workflows/pages.yml` | docs.github.com/pages ; github.com/actions/deploy-pages/releases ; github.com/actions/upload-pages-artifact/releases | 2026-11-25 |
| **GitHub Actions** | `actions/checkout@v4` and `actions/setup-node@v4` pinned by tag, not by SHA (the `@v4` tags declare `using: node20`; `@v6` declare `node24`, see the roadmap item); `ubuntu-latest` runners; Node 22. Dependabot raises new versions | `.github/workflows/ci.yml`, `.github/workflows/pages.yml` | github.com/actions/checkout/releases ; github.com/actions/setup-node/releases ; github.com/actions/runner-images | 2026-11-25 |
| **Node.js** | `engines.node: ">=22"`; CI and the Pages build use Node 22; tests use `node:test` and `node:assert/strict`; the build uses only the standard library | `package.json`, `.github/workflows/ci.yml` | nodejs.org/en/about/previous-releases (22's end-of-life date) | 2026-11-25 |
| **Service worker and Cache API (demo)** | `navigator.serviceWorker.register("sw.js")` and `caches.open` / `cache.addAll` keep the demo working offline after the first load | `site/sw.js`, `site/demo.js` | developer.mozilla.org/docs/Web/API/Service_Worker_API | 2026-11-25 |
| **Org consent script** | Not loaded by the demo today; the homepage in `receipts-site` loads `https://ai-automation-tools.dev/consent.js` | `receipts-site` repo `index.html` | The org landing repo's `consent.js` | 2026-11-25 |

## Dev dependencies

Majors only: a patch or minor bump is Dependabot's job and never makes this table wrong. The
exact ranges are in `package.json`. The extension and the demo have no runtime dependencies.

| Upstream | Major in `package.json` | Check at | Last checked |
|:---|:---|:---|:---|
| ESLint, @eslint/js | 9 | eslint.org/blog (flat config, v10 migration notes) | 2026-11-25 |
| globals | 16 | github.com/sindresorhus/globals/releases | 2026-11-25 |
| linkedom *(parses the saved Google pages in tests only)* | 0.18 | github.com/WebReflection/linkedom/releases | 2026-11-25 |

Flag breaking majors, EOL runtimes, and security advisories only. Routine bumps are
Dependabot's job.
