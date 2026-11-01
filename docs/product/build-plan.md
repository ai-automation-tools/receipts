# Build plan: Receipts

> Copied from the Receipts business plan (`Analysis/receipts/build/build-plan.md` in the private pipeline workspace) on 2026-11-01. The roadmap's slice order comes from here.

**Spec:** [spec.md](spec.md) · **Architecture:** [adr-001-local-only.md](../decisions/adr-001-local-only.md), [adr-002-shared-matcher-module.md](../decisions/adr-002-shared-matcher-module.md) · **Estimate:** about 30 agent runs (the estimate stays in the private plan)

**The MVP is Slices 0-6 (about 27 runs, 3 spare).** It is three features: the matcher library with a published eval (Slices 0-2), the extension check flow (Slices 3-4), and the Pages demo (Slice 5), plus release prep (Slice 6). Everything under "After release" is built after the public repo exists.

## Slice 0 - Walking skeleton `[MVP]` (2 runs)

Repo scaffold, CI, the prototype's `matcher.js` ported to a dependency-free ES module (ADR-002) with unit tests on its figure parser and sentence splitter. **Proves:** the prototype logic survives extraction and one command runs the tests in CI.

## Slice 1 - Labeled eval set and harness `[MVP]` (4 runs)

- **Delivers:** M4. 40 or more claim/source pairs hand-labeled `supported / partial / conflict / absent`, stored as fixtures; `npm run eval` prints precision, recall and FPR per status.
- **De-risks:** the key assumption (matcher FPR). If the numbers are bad, we learn it in week 2, not week 8.
- **Done when:** eval runs in CI and prints a table; the README shows it.

## Slice 2 - Status policy and figure-conflict detector `[MVP]` (4 runs)

- **Delivers:** the narrowed policy: `found`, `conflict`, `not located`, `unreachable`; thresholds tuned on the eval; the CI precision gate (flag precision 0.5, conflict 0.6).
- **De-risks:** the quality gate in the memo. Falsifier check on 2026-11-20.
- **Done when:** gate passes on the eval, or the memo's fallback (library + demo only) is invoked.

## Slice 3 - Content script on saved Google fixtures `[MVP]` (6 runs)

- **Delivers:** M1 (extraction half). Detects the overview by its visible heading, pairs claims with cited links, handles `/url?q=` redirects, against five or more saved real pages.
- **De-risks:** the schedule owner (40% of variance) and Google-markup fragility.
- **Done when:** tests over all saved pages extract the same claim/link pairs; the one-page re-capture procedure is documented.

## Slice 4 - Fetch, popup, report `[MVP]` (4 runs)

- **Delivers:** M1 (check half), M2, M3, S1, S2. Service worker fetch with caps, popup list, copy report, optional host permission, the network-recording test.
- **Done when:** end-to-end test on fixtures passes; the M3 test fails if any non-cited host is contacted.

## Slice 5 - GitHub Pages demo `[MVP]` (4 runs)

- **Delivers:** M5. Paste claim and source, three canned examples, same matcher module.
- **Done when:** deployed from CI to Pages; works offline after first load.

## Slice 6 - Release prep `[MVP]` (3 runs)

README with the measured accuracy table, privacy statement matching ADR-001, permissions table, store listing text and screenshots, a signed-off zip. **Done when:** every release-gate item in the roadmap is ticked except the human ones (store submission, going public).

## After release (not MVP)

- **P1** Firefox build (2 runs). **P2** in-browser NLI tier, only if the eval proves lexical matching insufficient and ADR-001 is amended (8 runs). **P3** Other surfaces (Perplexity, Bing) (4 runs each). **P4** Live-markup canary as a scheduled job, if allowed (2 runs). **P5** Launch posts: Show HN, GEO communities, the WashU authors (Mike).

## Definition of done

Acceptance criteria pass including empty states (no overview, no citations, unreachable page, 0-claim overview) and error paths (timeout, non-HTML, declined permission); tests run in CI and are concentrated on the matcher, the figure parser and the network-recording test; input from pages is treated as untrusted (no `innerHTML` with page text); nothing secret exists to log; deployed to Pages or packaged, not just merged.

## Cut list (if the estimate runs over)

Could first (C1, C2), then Should (S1, S2). Must is defended; if M4 or M3 has to go, the spec reopens, because those two are the differentiation.

## What we learn, and when we'd stop

After Slice 2 (about week 3) we know whether the matcher is good enough to ship. The memo's falsifiers apply: stop or fall back to library-plus-demo if conflict precision is under 0.6 on 2026-11-20; drop the extension if five real fixtures cannot be captured by 2026-11-13; stop feature work if the repo has under 100 installs and under 50 stars by 2027-03-31.
