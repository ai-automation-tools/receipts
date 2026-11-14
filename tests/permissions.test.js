import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../src/extension/manifest.json", import.meta.url), "utf8"));
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

// Everything the manifest can ask the browser for: API permissions, host access and content script matches.
function requested(m) {
  return [
    ...(m.permissions ?? []),
    ...(m.optional_permissions ?? []),
    ...(m.host_permissions ?? []),
    ...(m.optional_host_permissions ?? []),
    ...(m.content_scripts ?? []).flatMap((c) => c.matches ?? []),
  ];
}

// The first-column values of the README's permissions table.
function listed(text) {
  const start = text.indexOf("<!-- permissions:start -->");
  const end = text.indexOf("<!-- permissions:end -->");
  assert.ok(start >= 0 && end > start, "README is missing the permissions table markers");
  return new Set([...text.slice(start, end).matchAll(/^\|\s*`([^`]+)`/gm)].map((m) => m[1]));
}

const unlisted = (m, text) => requested(m).filter((p) => !listed(text).has(p));

test("every permission the manifest asks for is in the README permissions table", () => {
  assert.deepEqual(unlisted(manifest, readme), []);
});

test("the check catches a permission the table doesn't list", () => {
  const extra = { ...manifest, permissions: ["storage", "tabs"], content_scripts: [{ matches: ["https://www.bing.com/*"] }] };
  assert.deepEqual(unlisted(extra, readme), ["tabs", "https://www.bing.com/*"]);
});
