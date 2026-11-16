# Google AI Overview fixtures

Six real Google results pages that show an AI Overview, for the content script's tests: each one
must yield the same claim/link pairs every run. Saved by hand from a desktop Chrome session; an
unattended run can't capture them (a logged-out `curl` gets the "enable JavaScript" page, and
headless or automated browsers get Google's "unusual traffic" page).

| File | Query | Locale | Captured | A figure in the overview |
|:---|:---|:---|:---|:---|
| `mars-distance.html` | how far is mars from earth | `en`, US | 2026-11-16 | 140 million miles |
| `adult-sleep.html` | how much sleep do adults need | `en`, US | 2026-11-16 | 7 to 9 hours |
| `adult-exercise.html` | how many minutes of exercise per week do adults need | `en`, US | 2026-11-16 | 150 minutes |
| `ocean-depth.html` | how deep is the ocean on average | `en`, US | 2026-11-16 | 3,682 meters |
| `moon-travel.html` | how long does it take to get to the moon | `en`, US | 2026-11-16 | about 3 days |
| `earth-water.html` | what percentage of the earth is covered by water | `en`, US | 2026-11-16 | 71% |

The topics match the eval pages in [`../eval/`](../eval/README.md), so most overviews cite NASA,
CDC, NOAA or USGS pages.

## What each file is

The rendered page (Chrome's **Save as → Webpage, Complete**, so the overview built after load is
in the markup), with the overview expanded by **Show more** before saving. Then scrubbed:

- every `<script>`, `<style>`, `<iframe>`, `<link>` and `<meta>` removed, base64 images replaced
  with `data:,`, and the `_files` asset folder deleted. The overview's markup, text and cited
  links are untouched;
- the signed-in account's name, email and avatar, and the location line ("Based on your places")
  and city, replaced with `[redacted]`. Nothing finer than the country is left.

Each file contains the overview's visible heading, `AI Overview`.

## Re-capturing

Do this when Google's markup changes and the content script stops finding the overview.

1. In desktop Chrome, open `https://www.google.com/search?q=<query>&hl=en` for a query in the
   table. Skip any query that shows no AI Overview, and add another factual query with figures
   instead.
2. Click **Show more** on the overview, if it has one.
3. Press Ctrl+S, choose **Webpage, Complete**, and save over the file in this folder.
4. Scrub it: drop scripts, styles, iframes, links, metas and base64 images, delete the `_files`
   folder, and replace your account name, email, avatar URL and any location finer than the
   country with `[redacted]`. Then search the file for your name, email and city; it must find
   nothing.
5. Check it: `grep -c "AI Overview" <file>` is at least 1, and the overview's figures and cited
   links are still in the file.
6. Update the row's **Captured** date and figure, and run the tests.
