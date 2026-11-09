// npm run eval: scores every labeled claim/source pair in tests/fixtures/eval/ through
// src/matcher.js and prints precision, recall and false-positive rate per status as Markdown.
// It exits non-zero when the precision gate (GATE) fails, which fails CI.
// `npm run eval -- --readme` also writes the table into README.md between the eval markers.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { score } from "../src/matcher.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(root, "tests", "fixtures", "eval");
export const README_START = "<!-- eval:start -->";
export const README_END = "<!-- eval:end -->";

// What a correct matcher says for each hand label. "partial" means the page backs only part of
// the claim, so the sentence isn't there to find: the honest answer is "not located".
export const EXPECTED = {
  supported: "found",
  partial: "not located",
  conflict: "conflict",
  absent: "not located",
};

export function loadPairs() {
  return JSON.parse(readFileSync(join(fixtures, "pairs.json"), "utf8"));
}

export function runEval(pairs = loadPairs()) {
  const pages = new Map();
  const results = pairs.map((pair) => {
    if (!pages.has(pair.page)) pages.set(pair.page, readFileSync(join(fixtures, "pages", `${pair.page}.txt`), "utf8"));
    return { ...pair, expected: EXPECTED[pair.label], got: score(pair.claim, pages.get(pair.page)).status };
  });

  const rate = (num, den) => (den === 0 ? "n/a" : (num / den).toFixed(2));
  const row = (name, isExpected, isPredicted) => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const r of results) {
      const e = isExpected(r), p = isPredicted(r);
      if (e && p) tp++;
      else if (p) fp++;
      else if (e) fn++;
      else tn++;
    }
    return `| ${name} | ${tp + fn} | ${tp + fp} | ${rate(tp, tp + fp)} | ${rate(tp, tp + fn)} | ${rate(fp, fp + tn)} |`;
  };
  const lines = [
    `${results.length} hand-labeled claim/source pairs from ${pages.size} saved public pages.`,
    "",
    "| Status | Expected | Predicted | Precision | Recall | False-positive rate |",
    "|:---|---:|---:|---:|---:|---:|",
    ...["found", "conflict", "not located"].map((s) => row(`\`${s}\``, (r) => r.expected === s, (r) => r.got === s)),
    row("any flag (not `found`)", (r) => r.label !== "supported", (r) => r.got !== "found"),
  ];
  return { results, table: lines.join("\n") };
}

// The precision gate (spec M4, the decision memo's quality bar). Never lower these to pass:
// a miss is the memo's falsifier, and the call is Mike's.
export const GATE = { flag: 0.5, conflict: 0.6 };

// One message per gate the results miss; empty when the gate passes. A status never predicted
// has no precision to miss.
export function gateFailures(results) {
  const precision = (isPredicted, isRight) => {
    const predicted = results.filter(isPredicted);
    return predicted.length ? predicted.filter(isRight).length / predicted.length : 1;
  };
  const flag = precision((r) => r.got !== "found", (r) => r.label !== "supported");
  const conflict = precision((r) => r.got === "conflict", (r) => r.expected === "conflict");
  const failures = [];
  if (flag < GATE.flag) failures.push(`flag precision ${flag.toFixed(2)} is under ${GATE.flag}`);
  if (conflict < GATE.conflict) failures.push(`conflict precision ${conflict.toFixed(2)} is under ${GATE.conflict}`);
  return failures;
}

export function withTable(readme, table) {
  const start = readme.indexOf(README_START);
  const end = readme.indexOf(README_END);
  if (start === -1 || end < start) throw new Error("README.md is missing the eval markers");
  const eol = readme.includes("\r\n") ? "\r\n" : "\n";
  const block = table.split("\n").join(eol);
  return `${readme.slice(0, start + README_START.length)}${eol}${block}${eol}${readme.slice(end)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { results, table } = runEval();
  console.log(table);
  const failures = gateFailures(results);
  for (const failure of failures) console.error(`Precision gate failed: ${failure}`);
  if (failures.length) process.exitCode = 1;
  else console.log(`\nPrecision gate passed (flag >= ${GATE.flag}, conflict >= ${GATE.conflict}).`);
  if (process.argv.includes("--readme")) {
    const path = join(root, "README.md");
    writeFileSync(path, withTable(readFileSync(path, "utf8"), table));
    console.log("\nWrote the table to README.md");
  }
}
