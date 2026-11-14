# AGENTS.md

Standing orders for the agent that works this repo, usually the Receipts Weekly Roadmap
routine.

## What Receipts is

A free Chrome and Edge extension (Manifest V3) that checks each claim in a Google AI Overview
against the page it cites. On a results page the user clicks Check. A content script reads
the overview, splits it into claims and pairs each with its cited links. The service worker
fetches each cited page logged out and runs a lexical matcher over it: shared words and
figures, no model. Every claim gets `found`, `conflict`, `not located` or `unreachable`, with
the quoted passage and its domain as evidence. The same matcher module also powers a
paste-in demo on GitHub Pages and `npm run eval`, which measures its precision and recall on
40 or more hand-labeled claim/source pairs and publishes them in the README.

The bet under the project: a local, key-free checker whose flags are mostly right (flag
precision 0.5 or better) is something people install and share. The eval comes first because
nobody has measured the matcher yet. The repo goes public at the MVP (build plan Slices 0 to
6). The decision memo's falsifiers (fixtures by 2026-11-13, precision by 2026-11-20, installs
by 2027-03-31) are Mike's calls when they trip, not yours: mark the item `- [!]` with the
numbers and stop.

Full spec: `docs/product/spec.md`. Slice order: `docs/product/build-plan.md`. Decisions:
`docs/decisions/`. Work queue: `docs/ROADMAP.md`.

## Stack

- Plain JavaScript, ES modules (`"type": "module"`), no TypeScript, no bundler. MV3 loads ES
  modules in the service worker (`"type": "module"`) and in extension pages directly.
  **npm**, not pnpm or yarn. Node 22 or newer for the scripts and tests; CI uses Node 22.
- `src/extension/` is the unpacked extension. `npm run build` (`scripts/build.js`) checks the
  manifest is MV3 and copies the folder to `dist/extension/`, which is what gets loaded in
  `chrome://extensions`. The build copies `src/matcher.js` into the extension too, so the
  extension runs the same file the eval scores.
- `src/matcher.js` is a pure ES module with **no dependencies and no DOM or `chrome.*` use**,
  exporting `score(claim, pageText) -> { status, passage, figures }`. The extension, `site/`
  and `npm run eval` all import it (ADR-002). Changes to it go through the eval first: run
  `npm run eval -- --readme` and commit the README table, or `npm test` fails.
- Tests: `node:test` and `node:assert/strict`, files in `tests/*.test.js`. No Jest, no
  Vitest. Fixtures (saved Google pages, labeled eval pairs, cited-page HTML) live under
  `tests/fixtures/`. Tests never reach the internet.
- Lint: ESLint 9 flat config (`eslint.config.js`), `@eslint/js` recommended, with browser and
  webextension globals for `src/` and `site/`, Node globals for `scripts/` and `tests/`.
- Runtime dependencies: none, and keep it that way. Dev dependencies need a line in the PR
  body saying why.
- The demo lives in `site/`. GitHub Pages is not enabled yet; the live-demo item adds the
  `actions/deploy-pages` workflow. Until then, don't add a Pages workflow, or CI on `main`
  goes red.

## Verify

Run these from the repo root. All of them must pass before a PR opens. CI runs the same four.
`npm run eval` prints the accuracy table and fails under the precision gate (flag 0.5,
conflict 0.6, `GATE` in `scripts/eval.js`).

```
npm run lint
npm test
npm run build
npm run eval
```

## Architecture decisions that are already made

- **ADR-001: nothing leaves the browser except fetches of the cited pages.** No analytics, no
  API key, no server, no remote model. Cited pages are fetched with `credentials: "omit"`.
  From Slice 4 on, a test records every network request during a check and fails on any host
  that isn't a cited URL. Never weaken that test.
- **ADR-002: one matcher module** shared by the extension, the demo and the eval. Never copy
  its code into another file.

## Won't (this version)

Carried from the spec. If a roadmap item seems to need one of these, stop and flag it.

- **A daily check cap, Pro tier, payments or licences.** The org ships free MIT tools.
- **An LLM or NLI model**, in the browser or remote, until the eval proves lexical matching
  isn't enough and ADR-001 is amended (post-MVP P2).
- **Bing Copilot, Perplexity, ChatGPT search or Google AI Mode.** Google AI Overviews only.
- **Firefox or Safari builds** before release.
- **Check history, sync, accounts, or a server of any kind.**
- **Fetching pages with the user's cookies.** Logged out only.
- **"True" or "false" verdicts.** Receipts only says whether the cited page contains the
  sentence. `not located` reads "no close passage found in the pages Google cited" and never
  says the claim is wrong.

## Standards

- **Page text is untrusted.** Text from the results page or a fetched page never goes into
  `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `eval`. Build the popup and the demo with
  `textContent` and DOM methods.
- **Permissions stay minimal**: `storage`, the content script on
  `https://www.google.com/search*`, and `https://*/*` as an optional host permission asked for
  on the first Check. Any new permission needs a README permissions-table line and a reason
  in the PR body; `tests/permissions.test.js` fails on a manifest permission the table lacks.
- **Fetch limits** from the spec: 8 s timeout per page, 600,000-character read cap.
- **Accessibility**: the popup and demo work from the keyboard, and a status is never shown by
  colour alone.
- **Settings live in `.env`, names in `.env.example`.** Receipts has none today. If a Node
  script ever needs one, it reads `.env` at the repo root with `util.parseEnv`, a variable
  already in the real environment wins, and the name goes in `.env.example` with where its
  value comes from, never the value. Never document Windows user environment variables or
  `setx`.
- **Fixtures hold no personal data.** Saved Google pages are stripped of account names, avatars
  and precise location, and every eval pair records its source URL and retrieval date.
- This repo goes public at graduation. Never commit `.env`, tokens, real personal data, or
  local paths like `C:\Users\...` or `D:\...`.
- Commit messages: plain imperative sentences ("Add the figure-conflict detector"), no
  Conventional Commit prefixes.

## What "done" means for a roadmap item

1. The item's own text is true of the code, checked by running it.
2. `npm run lint`, `npm test` and `npm run build` pass, and new behavior has a test.
3. Anything the change made untrue is fixed: `README.md`, `docs/`, this file.
4. `docs/CHANGELOG.md` has a line for it, tagged with the roadmap phase in italics, in the
   same commit that flips the box to `- [x]` with a ` — done YYYY-MM-DD: <what landed>` note.
5. It's on a `roadmap/auto-<date>` branch with a PR into `main`. Never push to `main`.
