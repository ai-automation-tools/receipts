// Receipts matcher: does the cited page contain the claim? Shared words and figures, no model.
// Pure ES module with no dependencies, no DOM and no chrome.* (ADR-002): the extension, the
// demo and `npm run eval` all import this file. Change it only with the eval run before and after.

// Tuned on the eval set (2026-11-09) with a grid over FOUND_COVERAGE 0.40-0.85, CONFLICT_COVERAGE
// 0.30-0.85 and WINDOW 1-4: FOUND_COVERAGE 0.65-0.80 with CONFLICT_COVERAGE 0.55 all score 42 of
// 50 pairs right, against 40 for the first guesses (0.6, 0.5). 0.70 sits mid-plateau. Fifty pairs
// is a small set, so re-run the sweep when the set grows rather than chase single pairs.
export const FOUND_COVERAGE = 0.7; // share of the claim's words a passage must contain
export const CONFLICT_COVERAGE = 0.55; // a figure conflict needs a passage this close
const WINDOW = 3; // a passage is up to this many consecutive sentences

const STOPWORDS = new Set(
  ("a an and are as at be been being but by can could did do does for from had has have how if " +
    "in into is it its of on or our so such than that the their them then there these they this " +
    "those to was we were what when where which while who whose will with would you your about " +
    "also more most very just over each other some any all")
    .split(" "),
);

const NUMBER_WORDS = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12,
};
const SCALES = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
const ABBREVIATION = /(?:\b(?:U\.S|U\.K|e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|St|No|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec)|\b[A-Z])\.$/;

// Light suffix stripper, enough to pair "moving" with "moves" and "miles" with "mile".
export function stem(word) {
  let w = word.toLowerCase();
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  const before = w;
  for (const suffix of ["ing", "ed", "es", "ly", "s"]) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      if (suffix === "s" && /(?:ss|us|is)$/.test(w)) break;
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  if (w !== before && /([b-df-hj-np-tv-z])\1$/.test(w)) w = w.slice(0, -1); // running -> run
  if (w.endsWith("e") && w.length > 3) w = w.slice(0, -1);
  return w;
}

// Content-word stems, without stopwords and without numbers (figures are compared separately).
export function words(text) {
  const out = new Set();
  for (const token of text.toLowerCase().match(/[a-z]+/g) ?? []) {
    if (token.length < 2 || STOPWORDS.has(token) || Object.hasOwn(NUMBER_WORDS, token)) continue;
    out.add(stem(token));
  }
  return out;
}

export function splitSentences(text) {
  const sentences = [];
  for (const line of text.split(/[\r\n]+/)) {
    let current = "";
    for (const piece of line.split(/(?<=[.!?])\s+/)) {
      if (current && !ABBREVIATION.test(current) && !/^[a-z]/.test(piece)) {
        sentences.push(current);
        current = piece;
      } else {
        current = current ? `${current} ${piece}` : piece;
      }
    }
    if (current.trim()) sentences.push(current.trim());
  }
  return sentences;
}

const FIGURE =
  /(?<![\w.,])(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b)(\s*%)?(?:\s+(thousand|million|billion|trillion)\b)?/gi;
// Skipped between a figure and its unit: "14-17 hours", "7 or more hours", "930 and 1,300 miles".
const FILLER = /^(?:[\s()–-]|or\b|more\b|than\b|and\b|to\b|thousand\b|million\b|billion\b|trillion\b|-?\d[\d,.]*)+/i;

// Every figure in the text, with its value and the word after it as a unit ("hour", "percent").
export function parseFigures(text) {
  const figures = [];
  for (const m of text.matchAll(FIGURE)) {
    const [raw, number, percent, scale] = m;
    const lower = number.toLowerCase();
    let value = Object.hasOwn(NUMBER_WORDS, lower) ? NUMBER_WORDS[lower] : Number(number.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    const decimals = (number.split(".")[1] ?? "").length;
    const multiplier = scale ? SCALES[scale.toLowerCase()] : 1;
    value *= multiplier;
    let unit = "";
    if (percent) unit = "percent";
    else {
      const rest = text.slice(m.index + raw.length, m.index + raw.length + 40).replace(FILLER, "");
      const word = rest.match(/^[a-z]+/i);
      if (word) unit = word[0].toLowerCase() === "percent" ? "percent" : stem(word[0]);
    }
    figures.push({ raw: raw.trim(), value, unit, decimals, multiplier });
  }
  return figures;
}

// Equal, or equal once the page's figure is rounded the way the claim's was ("about 70%"), and
// not counting a figure about something else ("Example 3" is not "3 days").
function sameFigure(claim, page) {
  if (claim.unit !== page.unit) return false;
  if (claim.value === page.value) return true;
  const factor = 10 ** claim.decimals;
  return Math.round((page.value / claim.multiplier) * factor) / factor === claim.value / claim.multiplier;
}

function coverage(claimWords, passageWords) {
  if (claimWords.size === 0) return 0;
  let shared = 0;
  for (const w of claimWords) if (passageWords.has(w)) shared++;
  return shared / claimWords.size;
}

// score(claim, pageText) -> { status, passage, figures }
// status is "found", "conflict", "not located" or "unreachable". It says whether the page
// contains the claim, never whether the claim is true. figures lists each figure in the claim
// with the page's figure beside it: the matching one, the conflicting one, or null.
export function score(claim, pageText) {
  if (typeof pageText !== "string" || !pageText.trim()) {
    return { status: "unreachable", passage: "", figures: [] };
  }
  const claimWords = words(claim);
  const claimFigures = parseFigures(claim);
  const sentences = splitSentences(pageText);

  const windows = [];
  for (let i = 0; i < sentences.length; i++) {
    for (let k = 1; k <= WINDOW && i + k <= sentences.length; k++) {
      const text = sentences.slice(i, i + k).join(" ");
      windows.push({ text, cover: coverage(claimWords, words(text)) });
    }
  }
  // Highest coverage first; on a tie the shorter passage is the closer quote.
  windows.sort((a, b) => b.cover - a.cover || a.text.length - b.text.length);

  const compare = (text) => {
    const pageFigures = parseFigures(text);
    return claimFigures.map((cf) => {
      const match = pageFigures.find((pf) => sameFigure(cf, pf));
      const rival = cf.unit && pageFigures.find((pf) => pf.unit === cf.unit);
      return { claim: cf.raw, page: (match ?? rival)?.raw ?? null, matched: Boolean(match), rival: !match && Boolean(rival) };
    });
  };
  const shape = (figures) => figures.map(({ claim: c, page }) => ({ claim: c, page }));

  for (const w of windows) {
    if (w.cover < FOUND_COVERAGE) break;
    const figures = compare(w.text);
    if (figures.every((f) => f.matched)) return { status: "found", passage: w.text, figures: shape(figures) };
  }
  const best = windows[0];
  if (best && best.cover >= CONFLICT_COVERAGE) {
    const figures = compare(best.text);
    if (figures.some((f) => f.rival)) return { status: "conflict", passage: best.text, figures: shape(figures) };
  }
  return { status: "not located", passage: "", figures: [] };
}
