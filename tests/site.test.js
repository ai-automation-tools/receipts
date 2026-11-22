import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { score } from "../src/matcher.js";
import { EXAMPLES } from "../site/examples.js";
import { buildSite } from "../scripts/build.js";

const site = new URL("../site/", import.meta.url);
const read = (name) => readFileSync(new URL(name, site), "utf8");

test("each canned example is public, dated and scores as its label says", () => {
  assert.deepEqual(EXAMPLES.map((e) => e.expected), ["found", "conflict", "not located"]);
  for (const e of EXAMPLES) {
    assert.match(e.url, /^https:\/\/[a-z.]+\.gov\//, e.label);
    assert.match(e.retrieved, /^\d{4}-\d{2}-\d{2}$/, e.label);
    assert.equal(score(e.claim, e.source).status, e.expected, e.label);
  }
});

test("the demo imports the shared matcher and never keeps a copy of it (ADR-002)", () => {
  assert.match(read("demo.js"), /from "\.\/matcher\.js"/);
  assert.ok(!existsSync(new URL("matcher.js", site)));
});

test("no demo script puts text into the page as HTML", () => {
  for (const name of readdirSync(site).filter((f) => f.endsWith(".js"))) {
    assert.doesNotMatch(read(name), /innerHTML|outerHTML|insertAdjacentHTML|\beval\(|document\.write/, name);
  }
});

test("the page keeps the source bar, the favicon and the build stamp, with relative paths", () => {
  const html = read("index.html");
  assert.match(html, /class="src-bar"[\s\S]*href="https:\/\/github\.com\/ai-automation-tools\/receipts"[\s\S]*View source/);
  assert.match(html, /<link rel="icon" href="favicon\.svg"/);
  assert.match(html, /<meta name="build" content="__BUILD_SHA__">/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
});

test("buildSite copies the demo with the matcher, and the offline cache lists only files it ships", () => {
  const outDir = join(mkdtempSync(join(tmpdir(), "receipts-")), "site");
  buildSite(outDir);
  const source = readFileSync(new URL("../src/matcher.js", import.meta.url), "utf8");
  assert.equal(readFileSync(join(outDir, "matcher.js"), "utf8"), source);
  const files = JSON.parse(read("sw.js").match(/const FILES = (\[.*\]);/)[1]);
  assert.ok(files.includes("matcher.js"));
  for (const file of files.filter((f) => f !== "./")) assert.ok(existsSync(join(outDir, file)), file);
});
