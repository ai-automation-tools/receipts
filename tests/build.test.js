import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../scripts/build.js";

test("build copies a Manifest V3 extension to the output folder", () => {
  const outDir = join(mkdtempSync(join(tmpdir(), "receipts-")), "extension");
  const { manifest } = build(outDir);
  assert.equal(manifest.manifest_version, 3);
  assert.ok(existsSync(join(outDir, "manifest.json")));
});

test("build copies the shared matcher into the extension unchanged", () => {
  const outDir = join(mkdtempSync(join(tmpdir(), "receipts-")), "extension");
  build(outDir);
  const source = readFileSync(new URL("../src/matcher.js", import.meta.url), "utf8");
  assert.equal(readFileSync(join(outDir, "matcher.js"), "utf8"), source);
});
