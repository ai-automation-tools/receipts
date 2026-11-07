<h1 align="center">🧩 Source</h1>

<p align="center">
  <em>The browser extension, and from Slice 0 the matcher it shares with the demo and the eval.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge" alt="Manifest V3">
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-repository_root-6B7280?style=for-the-badge" alt="Repository root"></a>
</p>

---

| Path | What's inside |
|:---|:---|
| [**extension/**](extension/manifest.json) | The unpacked extension. Only a manifest so far; `npm run build` copies it to `dist/extension/`. |
| [**matcher.js**](matcher.js) | `score(claim, pageText) -> { status, passage, figures }`: the closest passage of up to three sentences by shared word stems, then its figures against the claim's. `npm run build` copies it into the extension. |

`matcher.js` stays a plain ES module with no dependencies, no DOM and no `chrome.*`, because
the extension, `site/` and `npm run eval` all import it
([ADR-002](../docs/decisions/adr-002-shared-matcher-module.md)).

---

<p align="center">
  <a href="../README.md">← Repository home</a> ·
  <a href="../docs/README.md">Docs →</a>
</p>
