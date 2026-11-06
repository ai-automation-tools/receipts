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
> **The extension doesn't check anything yet.** `npm run build` produces a Manifest V3
> extension that loads but does nothing. The matcher and its eval are in (`npm run eval`); the
> check flow and the demo land one roadmap item at a time. See the [roadmap](docs/ROADMAP.md).

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

## 🎯 Measured accuracy

`npm run eval` runs every hand-labeled claim/source pair in
[`tests/fixtures/eval/`](tests/fixtures/eval/README.md) through `src/matcher.js`, the same file
the extension runs, and prints this table. `npm run eval -- --readme` writes it here, and a test
fails when the table below is out of date.

<!-- eval:start -->
50 hand-labeled claim/source pairs from 6 saved public pages.

| Status | Expected | Predicted | Precision | Recall | False-positive rate |
|:---|---:|---:|---:|---:|---:|
| `found` | 28 | 31 | 0.81 | 0.89 | 0.27 |
| `conflict` | 12 | 10 | 0.90 | 0.75 | 0.03 |
| `not located` | 10 | 9 | 0.67 | 0.60 | 0.07 |
| any flag (not `found`) | 22 | 19 | 0.84 | 0.73 | 0.11 |
<!-- eval:end -->

Read it with care: the set is small, its claims and labels were written by the roadmap agent
that wrote the matcher, and the thresholds aren't tuned yet (Slice 2 tunes them and adds the
CI gate). A **flag** is any status but `found`; a flag is right when the page doesn't fully
back the claim.

## 📊 Planned features

| Feature | Status |
|:---|:---|
| **Matcher with published accuracy** | Matcher and eval done (Slices 0-1): `src/matcher.js` and a 50-pair labeled eval. Tuned thresholds and the CI gate on flag precision come in Slice 2. |
| **Extension check flow** | Planned (Slices 3-4). Content script, logged-out fetches of the cited pages, popup with the evidence, copy report. |
| **Try-it demo** | Planned (Slice 5). Paste a claim and its source on GitHub Pages and run the same matcher, offline. |

## 🚀 Quick start (for contributors)

```bash
npm ci                                       # install dev dependencies
npm run lint && npm test && npm run build    # what CI runs, then npm run eval
npm run eval                                 # matcher accuracy on the labeled pairs
# then load dist/extension/ in chrome://extensions with "Load unpacked"
```

## ⚠️ What it is not

Receipts says whether the cited page contains the sentence. It doesn't say whether the
sentence is true. It won't use an LLM, won't check Bing, Perplexity or ChatGPT search, won't
fetch pages with your logins, and won't keep a history. The full list is in the
[spec](docs/product/spec.md).

## 📖 Documentation

| Section | What's inside |
|:---|:---|
| [**📚 docs/**](docs/README.md) | The roadmap, changelog, product spec, build plan and ADRs. |
| [**🧩 src/**](src/README.md) | The extension source and the matcher it shares with the demo and the eval. |
| [**🌐 site/**](site/index.html) | The demo page GitHub Pages will serve. A "coming soon" shell for now. |
| [**🔒 SECURITY.md**](SECURITY.md) | How to report a vulnerability, and what counts as one here. |

---

<p align="center">
  <a href="docs/README.md">Docs</a> · <a href="SECURITY.md">Security</a> · <a href="LICENSE">MIT License</a>
</p>
