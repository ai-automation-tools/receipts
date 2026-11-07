# Eval fixtures

The labeled set `npm run eval` scores ([`scripts/eval.js`](../../../scripts/eval.js)).

- `pages/*.txt`: the text of six public US government pages (NASA, CDC, NOAA), saved by hand
  on 2026-11-06. Public domain, no personal data. Tags and scripts are stripped; on the NASA
  pages, short navigation lines (under nine words) are dropped too.
- `pairs.json`: one entry per claim/source pair: `id`, `page` (the file in `pages/`), the
  source `url`, the `retrieved` date, the `claim`, and its hand `label`.

## Labels

| Label | Means | A correct matcher says |
|:---|:---|:---|
| `supported` | The page says what the claim says. | `found` |
| `partial` | The page backs part of the claim; the rest isn't there. | `not located` |
| `conflict` | The page contradicts the claim, by a figure or in words. | `conflict` |
| `absent` | The page doesn't discuss the claim. | `not located` |

Claims are written the way an AI Overview words them: paraphrases, figures with units, and some
deliberate mistakes (a changed figure, an added clause, a reversed statement). The labels were
set by reading the page, not by running the matcher. Some `conflict` pairs contradict the page
without a figure ("permanently dark"); a lexical matcher is expected to miss those, and the eval
counts it.

## Adding pairs

Save a public page's text into `pages/` by hand (no crawling, no personal data), add pairs with
its URL and the date you saved it, then run `npm run eval -- --readme` and commit the README
table with the fixtures.
