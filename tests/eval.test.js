import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { EXPECTED, GATE, gateFailures, loadPairs, runEval, withTable } from "../scripts/eval.js";

const pairs = loadPairs();
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

test("the eval set has 40 or more labeled pairs, each with its source and date", () => {
  assert.ok(pairs.length >= 40, `only ${pairs.length} pairs`);
  const ids = new Set();
  for (const pair of pairs) {
    assert.ok(!ids.has(pair.id), `duplicate id ${pair.id}`);
    ids.add(pair.id);
    assert.ok(Object.hasOwn(EXPECTED, pair.label), `${pair.id}: bad label ${pair.label}`);
    assert.match(pair.url, /^https:\/\//, pair.id);
    assert.match(pair.retrieved, /^\d{4}-\d{2}-\d{2}$/, pair.id);
    assert.ok(pair.claim.split(/\s+/).length >= 6, `${pair.id}: claims have 6+ words`);
    assert.ok(existsSync(new URL(`fixtures/eval/pages/${pair.page}.txt`, import.meta.url)), pair.id);
  }
});

test("every label is used", () => {
  assert.deepEqual(new Set(pairs.map((p) => p.label)), new Set(Object.keys(EXPECTED)));
});

test("the matcher passes the precision gate on the eval set", () => {
  assert.deepEqual(GATE, { flag: 0.5, conflict: 0.6 });
  assert.deepEqual(gateFailures(runEval(pairs).results), []);
});

test("the gate fails when flags or conflicts are mostly wrong", () => {
  const r = (label, got) => ({ label, expected: EXPECTED[label], got });
  assert.deepEqual(gateFailures([r("supported", "conflict"), r("conflict", "conflict"), r("supported", "found")]), [
    "conflict precision 0.50 is under 0.6",
  ]);
  assert.deepEqual(gateFailures([r("supported", "not located"), r("supported", "not located"), r("absent", "not located")]), [
    "flag precision 0.33 is under 0.5",
  ]);
  assert.deepEqual(gateFailures([r("supported", "found")]), []);
});

test("the README shows the current eval table", () => {
  const { table } = runEval(pairs);
  assert.equal(withTable(readme, table), readme, "run `npm run eval -- --readme` and commit README.md");
});
