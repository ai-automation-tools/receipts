# ADR-002: One dependency-free matcher module shared by extension, demo and eval

**Status:** proposed · **Reversibility:** two-way (internal)
**Serves:** [spec.md](../product/spec.md) (M4, M5)

## Context

The prototype already has `matcher.js` inside the extension. The Pages demo (M5) and the eval (M4) must score exactly what the extension scores, otherwise the published accuracy describes a different program.

## Options considered

1. **One ES module, no dependencies, imported by all three** - cost: one build step to bundle for the extension, or plain ES modules since MV3 supports them in the service worker and popup `[assum]`.
2. **Copy the code per target** - drift is guaranteed within weeks.

## Decision

Option 1. The deciding fact: M4's CI gate is meaningless unless the extension runs the same file.

## Exit cost

Low. If a model tier is added later (post-MVP P2), it plugs in behind the same function signature `score(claim, pageText) -> {status, passage, figures}`.

## Cost envelope

None recurring.

## Consequences

The matcher's input/output shape becomes a contract the three targets rely on; changes go through the eval first.
