# Open questions

Questions only Mike can answer. A roadmap run applies an answer once the `- Answer:` line is
filled in, then moves the entry under **Answered**.

## Open

### Will you save the five Google AI Overview fixtures by hand before 2026-11-13, or call the falsifier?
- Asked: 2026-11-06 by receipts-roadmap
- Context: An unattended run can't capture them. A logged-out `curl` of `google.com/search` gets the "enable JavaScript" page, and headless Edge gets the "unusual traffic" CAPTCHA, so no AI Overview either way. The decision memo says to drop the extension if five real fixtures can't be captured by 2026-11-13, and the roadmap item says you can save them by hand instead. Options: (a) save five or more results pages that show an AI Overview from your own browser (logged out or with account name, avatar and location stripped), put them in `tests/fixtures/google/` with the query, locale and date of each, and the next run writes the README and re-capture procedure around them; (b) call the falsifier and fall back to library plus demo only. Recommendation: (a). Only Phase 2 needs these pages, and the matcher eval (Slices 0-1) went ahead without them.
- Answer:

## Answered
