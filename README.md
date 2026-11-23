<a id="readme-top"></a>

<h1 align="center">🧾 Receipts</h1>

<p align="center">
  <em>Checks each claim in a Google AI Overview against the page it cites,<br>and shows you the sentence it found, or says it found none.</em>
</p>

<p align="center">
  <a href="docs/README.md"><strong>Explore the docs »</strong></a>
</p>

<p align="center">
  <a href="docs/ROADMAP.md">Roadmap</a>
  ·
  <a href="https://github.com/ai-automation-tools/receipts/issues">Report Bug</a>
  ·
  <a href="https://github.com/ai-automation-tools/receipts/issues">Request Feature</a>
</p>

<p align="center">
  <a href="https://receipts-demo.ai-automation-tools.dev/"><img src="https://img.shields.io/badge/Live_Demo-try_the_matcher-2ea44f?style=for-the-badge" alt="Live demo: try the matcher"></a>
  <img src="https://img.shields.io/badge/status-MVP_Prototype-F59E0B?style=for-the-badge" alt="Status: MVP prototype">
  <a href="docs/ROADMAP.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f?style=for-the-badge" alt="License: MIT"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES_modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript ES modules">
  <img src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Manifest V3">
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 22+">
</p>

---

> [!WARNING]
> **Not in the Chrome Web Store yet.** Build it and load it unpacked (below). The check flow is
> tested on six saved Google results pages; Google changes its markup, so if Check says a page
> with an AI Overview has none, please [open an issue](https://github.com/ai-automation-tools/receipts/issues).

## 💡 What it's for

Google's AI Overview puts a link next to each sentence it writes. A 2026 audit by researchers
at Washington University in St. Louis checked 98,020 of those sentences and found 11% weren't
supported by the pages they cited. Opening every link to check is slow, so mostly nobody does.

Receipts does the opening for you. Click Check on a results page and it reads the overview in
your own tab, fetches each cited page without your cookies, and finds the passage closest to
each claim by shared words and figures. Every claim gets one of four statuses:

| Status | Means |
|:---|:---|
| **found** | A passage on the cited page matches the claim. You see the passage and its domain. |
| **conflict** | The cited page has a close passage with a different figure. You see both figures. |
| **not located** | No close passage was found in the pages Google cited. It doesn't mean the claim is wrong. |
| **unreachable** | The cited page didn't load. |

There's no model, no API key, no account and no server. Nothing leaves your browser except the
requests for the cited pages.

## 🔒 Privacy

Nothing leaves your browser except the fetches of the pages Google cited, and those are made
logged out: without your cookies or logins (`credentials: "omit"`). There are no analytics and
no telemetry, no API key, no account, no server and no remote model. Your search, the overview
text and the results stay on your device. This is a standing promise
([ADR-001](docs/decisions/adr-001-local-only.md)): adding any other network call would be a
changed privacy statement, opt-in and off by default, never a quiet update.

### Permissions

<!-- permissions:start -->
| Permission | Kind | Why it's needed | In the manifest |
|:---|:---|:---|:---|
| `https://www.google.com/search*` | content script match | Reads the AI Overview and its cited links on a Google results page, in your own tab. It only reads the page. | Yes |
| `https://*/*` | optional host permission | Fetches the cited pages, logged out. Asked for on your first Check, not at install; if you decline, nothing is checked. | Yes, optional |
| `storage` | permission | Would keep a check's results on your device while the popup is closed. Never synced. Nothing is stored today. | No |
<!-- permissions:end -->

The extension will never ask for a permission this table doesn't list:
`tests/permissions.test.js` fails if the manifest gains one, and [SECURITY.md](SECURITY.md)
counts it as a vulnerability. Cited `http://` pages show as `unreachable`, because the host
permission covers `https://` only.

## 🎯 Measured accuracy

`npm run eval` runs every hand-labeled claim/source pair in
[`tests/fixtures/eval/`](tests/fixtures/eval/README.md) through `src/matcher.js`, the same file
the extension runs, and prints this table. `npm run eval -- --readme` writes it here, and a test
fails when the table below is out of date.

<!-- eval:start -->
50 hand-labeled claim/source pairs from 6 saved public pages.

| Status | Expected | Predicted | Precision | Recall | False-positive rate |
|:---|---:|---:|---:|---:|---:|
| `found` | 28 | 30 | 0.83 | 0.89 | 0.23 |
| `conflict` | 12 | 9 | 1.00 | 0.75 | 0.00 |
| `not located` | 10 | 11 | 0.73 | 0.80 | 0.07 |
| any flag (not `found`) | 22 | 20 | 0.85 | 0.77 | 0.11 |
<!-- eval:end -->

Read it with care: the set is small, its claims and labels were written by the roadmap agent
that wrote the matcher, and its thresholds were tuned on this same set, so expect lower numbers
on new pages. A **flag** is any status but `found`; a flag is right when the page doesn't fully
back the claim. `npm run eval` fails, and so does CI, when flag precision drops under 0.5 or
`conflict` precision under 0.6.

## 📊 Planned features

| Feature | Status |
|:---|:---|
| **Matcher with published accuracy** | Done (Slices 0-2): `src/matcher.js`, a 50-pair labeled eval, thresholds tuned on it, and a CI gate on flag and `conflict` precision. |
| **Extension check flow** | Built (Slices 3-4): the content script reads the overview and its cited links, the service worker fetches each cited page logged out (8 s, 600,000 characters) and scores it with the matcher, and the popup lists flagged claims first with the passage, domain and figures, and copies a plain-text report. Tested on six saved Google pages, with a test that fails on any request to a page the overview doesn't cite. |
| **Try-it demo** | Built (Slice 5): [`site/`](site/index.html), published by `.github/workflows/pages.yml` to [receipts-demo.ai-automation-tools.dev](https://receipts-demo.ai-automation-tools.dev/). Paste a claim and its source, or pick one of three examples, and run the same matcher in your browser, offline after the first load. |

## 🚀 Build and load it

You need Node 22 or newer and npm.

```bash
npm ci          # install the dev dependencies (lint and test tooling only; the extension has none)
npm run build   # check the manifest is MV3, copy src/extension/ and src/matcher.js to dist/extension/,
                # and site/ with src/matcher.js to dist/site/ (the demo)
```

1. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose the `dist/extension/` folder.
4. After each `npm run build`, click the reload icon on the Receipts card.

To try the demo locally, serve `dist/site/` with any static file server (it loads ES modules,
so opening the file directly won't work), for example `python -m http.server -d dist/site`, and
open `http://localhost:8000/`.

### Use it

1. Search Google for something factual and wait for the AI Overview. If it has **Show more**,
   click it, so every claim is on the page.
2. Click the Receipts icon in the toolbar. On a page with no AI Overview, the popup says so and
   Check stays disabled.
3. Click **Check**. The first time, the browser asks to let Receipts read and change data on
   all `https://` sites; that is how it fetches the cited pages. Decline, and nothing is checked.
4. The popup lists each claim (sentences of six or more words, at most 15) with its status and
   the cited page's domain, flagged claims first: the passage it found, both figures on a
   `conflict`, and "no close passage found in the pages Google cited" for `not located`. A claim
   citing several pages gets the best status any of them gives. A citation chip that reads
   "Space +4" counts as its first source only: the other four aren't links on the page until
   you open the chip.
5. **Copy report** puts a plain-text summary on the clipboard: the query, the date, and each
   claim with its status, domain and passage.

### Contributor checks

CI runs these on every pull request, and all of them must pass:

```bash
npm run lint    # ESLint
npm test        # node:test, offline
npm run build   # writes dist/extension/ and dist/site/
npm run eval    # the accuracy table above; exits non-zero under the precision gate
```

After any change to `src/matcher.js`, run `npm run eval -- --readme` to rewrite the table above
and commit it, or `npm test` fails.

## ⚠️ What it won't do

Receipts says whether the cited page contains the sentence. It doesn't say whether the
sentence is true. This version won't add any of these, so please don't file an issue asking
for one:

- **"True" or "false" verdicts.** `not located` means no close passage was found in the pages
  Google cited, never that the claim is wrong.
- **An LLM or NLI model**, in the browser or remote. Lexical matching stays until the eval shows
  it isn't enough.
- **Other AI answers**: Bing Copilot, Perplexity, ChatGPT search or Google AI Mode. Google AI
  Overviews only.
- **Firefox or Safari builds** before the first release.
- **Check history, sync, accounts, or a server** of any kind.
- **Fetching pages with your cookies.** Cited pages are fetched logged out.
- **A daily check cap, Pro tier, payments or licences.** It's free and MIT.

The source of this list is the [spec](docs/product/spec.md).

## 📖 Documentation

| Section | What's inside |
|:---|:---|
| [**📚 docs/**](docs/README.md) | The roadmap, changelog, product spec, build plan and ADRs. |
| [**🧩 src/**](src/README.md) | The extension source and the matcher it shares with the demo and the eval. |
| [**🌐 site/**](site/index.html) | The paste-in demo GitHub Pages serves: the page, its script, three canned examples and an offline cache. The build adds `src/matcher.js`. |
| [**🔒 SECURITY.md**](SECURITY.md) | How to report a vulnerability, and what counts as one here. |

---

<p align="center">
  <a href="docs/README.md">Docs</a> · <a href="SECURITY.md">Security</a> · <a href="LICENSE">MIT License</a>
</p>
