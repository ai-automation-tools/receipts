<h1 align="center">⚖️ Decisions</h1>

<p align="center">
  <em>The architecture calls Receipts was planned around, and what it would cost to undo each.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ADRs-2-8B5CF6?style=for-the-badge" alt="2 ADRs">
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-docs-6B7280?style=for-the-badge" alt="Docs home"></a>
</p>

---

| Decision | What it settles |
|:---|:---|
| [**ADR-001: local only**](adr-001-local-only.md) | Nothing leaves the browser except fetches of the cited pages. No model, no key, no analytics. A one-way promise once the README makes it. |
| [**ADR-002: one shared matcher**](adr-002-shared-matcher-module.md) | The extension, the Pages demo and the eval import the same dependency-free module, so the published accuracy describes the code people install. |

Both are still marked `proposed`, as they were in the business plan.

---

<p align="center">
  <a href="../README.md">← Docs home</a> ·
  <a href="adr-001-local-only.md">Next: ADR-001 →</a>
</p>
