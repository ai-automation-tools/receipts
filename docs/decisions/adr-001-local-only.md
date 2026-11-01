# ADR-001: Nothing leaves the browser except fetches of the cited pages

**Status:** proposed · **Reversibility:** one-way (as a public promise)
**Serves:** [spec.md](../product/spec.md) (M3)

## Context

The pitch against both rivals is privacy and setup: AI Fact Checker sends text to Google's Gemini API and needs a key; Theia routes through a backend proxy and discloses collecting page content `[fact, C, Chrome Web Store listings, 2026-10-22]`. A search query and the overview text are personal data. Once the README says "nothing leaves your browser", changing that is a public reversal.

## Options considered

1. **Local only, lexical matcher, no analytics** - cost: slower to improve accuracy; a model tier is blocked behind the eval. Build cost already in the 30-run estimate `[assum]`.
2. **Optional LLM judge with the user's own key** (what AI Fact Checker does) - more accurate on paraphrase `[assum]`; adds a key step and an outbound call; the pitch weakens.
3. **Own backend proxy** - a server to run and secure; a privacy story worse than option 1. Rejected.

## Decision

Option 1. The deciding fact: the whole differentiation from the two rivals is "no key, no account, no third party", and an unattended agent can enforce it with a network-recording test (M3).

## Exit cost

If we later add an optional model tier, it must be opt-in, off by default, and documented as a changed privacy statement. Cost: a README change and a version note, but trust is the thing spent; call it two weeks of agent work plus reputation `[assum]`.

## Cost envelope

Hosting: GitHub Pages, free `[assum]`. Chrome Web Store: one-time fee, reported as $5 `[fact, C, Chrome Web Store fee page; not confirmed against current docs]`. No servers, no per-use cost.

## Consequences

No telemetry means no install analytics beyond store counts and GitHub stars; the 100-installs falsifier uses store and GitHub numbers only. Accuracy ceilings are those of lexical matching until the eval says otherwise.
