# Spec: Receipts MVP (extension, matcher library, Pages demo)

> Copied from the Receipts business plan (`Analysis/receipts/build/spec.md` in the private pipeline workspace) on 2026-11-01. This copy is the one the roadmap works from.

**Decision it serves:** the plan's decision memo of 2026-10-22 (private) · **Status:** draft
**The bet being tested:** a local, key-free checker whose flags are mostly right (precision 0.5 or better) is something people will install and share. The first half is tested by slices 1-2, the second by launch.

## Users & jobs

- **Reader about to quote an overview** (writer, student, researcher). Job: see the sentence the cited page really contains. `[assum]`, no interviews.
- **GEO / SEO practitioner.** Job: audit how an overview treats a client's page. `[assum]`
- **Developer evaluating grounding checks.** Job: a small, measured, no-LLM matcher to read or embed. `[assum]`

## In scope (this version)

### Must

- **M1 Check an overview** - As a reader, I want to click once and see a status per claim in the AI Overview, so that I know which sentences to verify before I quote them.
  - AC: Given a Google results page with an AI Overview, When I click Check, Then each claim (6+ words, max 15) shows one of `found`, `conflict`, `not located`, `unreachable`, and the popup lists flagged claims first.
  - AC: Given a page with no overview, Then the popup says so and Check is disabled.
- **M2 Show the evidence** - As a reader, I want the quoted passage and domain behind every status, so that I judge the evidence myself instead of trusting a verdict.
  - AC: Every `found` and `conflict` shows the passage and its domain; `conflict` shows the figure on each side; `not located` says "no close passage found in the pages Google cited" and never says the claim is wrong.
- **M3 Stay local** - As a privacy-minded reader, I want nothing but the cited pages fetched, so that my searches and the overview text never reach a third party.
  - AC: An automated test records all network requests during a check and fails on any host that is not a cited URL. No analytics, no API keys. See [ADR-001](../decisions/adr-001-local-only.md).
- **M4 Published accuracy** - As a developer or sceptical reader, I want the matcher's measured precision, recall and false-positive rate on a labeled set in the README, so that I can decide whether to trust it.
  - AC: `npm run eval` runs over at least 40 labeled claim/source pairs and prints per-status precision/recall; the README table is regenerated from it; CI fails if overall flag precision drops under 0.5 or conflict precision under 0.6.
- **M5 Try it without installing** - As a visitor to the GitHub Pages site, I want to paste a claim and its source text and run the matcher in the browser, so that I can see how it behaves before installing.
  - AC: Given pasted claim and source text, When I click Check, Then the same matcher module as the extension returns the status and quoted passage with no network call. Three canned examples are one click each.

### Should

- **S1 Copy report** - plain-text summary of the check (query, date, claims, statuses, quotes) to the clipboard.
- **S2 Optional host permission** requested on first Check, not at install; declining explains nothing was checked.

### Could

- **C1** Keyboard shortcut. **C2** Badges placed in the page next to each claim (the popup list is the Must; in-page badges are polish).

## Explicitly out of scope (Won't, this version)

- Daily check cap, Pro tier, payments, site licences - the org ships free; the cap was a monetization device.
- LLM or NLI model, in the browser or remote - deferred until the eval proves lexical matching insufficient (post-MVP P2). Adding a model adds size, a key, or a network call.
- Bing Copilot, Perplexity, ChatGPT search, Google AI Mode - one surface until the matcher is trusted.
- Firefox / Safari builds - post-MVP.
- Check history, sync, accounts, server of any kind.
- Fetching pages with the user's cookies - cited pages are fetched logged-out.
- Verdicts of "true" or "false" - the tool only says whether the cited page contains the sentence.

## Non-functional requirements

- Check finishes in under 10 s for an overview with 4-6 cited pages on a normal connection `[assum: carried over from the prototype requirements]`.
- Per-page fetch: 8 s timeout, 600,000-character read cap, `credentials: "omit"` `[assum: prototype values, kept]`.
- Manifest V3; permissions only `storage`, `activeTab`/content script on `https://www.google.com/search*`, and optional `https://*/*` host access `[assum]`.
- Matcher is a pure ES module with no dependencies, shared by extension, demo and eval `[assum]`.
- Works in current Chrome and Edge `[assum]`.
- Accessibility: popup and demo are keyboard operable; status is never colour-only.

## Open questions

- Does Google serve the standard AI Overview markup to a scripted browser, and in how many locales? Owner: slice 3 agent run, by 2026-11-13.
- Is a live-markup canary (a scheduled CI job loading a Google page) allowed by Google's terms and by the sandbox the roadmap agents run in? Owner: Mike.
- Where does the labeled set come from without scraping at scale? Plan: 40 pairs hand-built from saved public pages, not a crawl. Owner: slice 1.

## Mike's approval notes

Mike approved the plan by closing [claude-routines#15](https://github.com/michaelschecht/claude-routines/issues/15) ("Plan approval: receipts") as Completed on 2026-10-23. He left no comments, so there are no extra conditions or scope changes: the spec above stands as written.
