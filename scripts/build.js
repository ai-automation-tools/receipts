// Builds the loadable extension and the demo site. The extension: copies src/extension/ to
// dist/extension/ and checks the manifest is Manifest V3; load dist/extension/ in
// chrome://extensions with "Load unpacked". The demo: copies site/ to dist/site/, which the
// Pages workflow publishes. src/matcher.js is copied into both, so the extension and the demo
// run the same file the eval scores (ADR-002).
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const matcher = join(root, "src", "matcher.js");

export function build(outDir = join(root, "dist", "extension")) {
  const manifest = JSON.parse(readFileSync(join(root, "src", "extension", "manifest.json"), "utf8"));
  if (manifest.manifest_version !== 3) throw new Error("manifest.json must be Manifest V3");
  rmSync(outDir, { recursive: true, force: true });
  cpSync(join(root, "src", "extension"), outDir, { recursive: true });
  if (existsSync(matcher)) cpSync(matcher, join(outDir, "matcher.js"));
  return { outDir, manifest };
}

export function buildSite(outDir = join(root, "dist", "site")) {
  rmSync(outDir, { recursive: true, force: true });
  cpSync(join(root, "site"), outDir, { recursive: true });
  cpSync(matcher, join(outDir, "matcher.js"));
  return { outDir };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { outDir, manifest } = build();
  console.log(`Built ${manifest.name} ${manifest.version} to ${outDir}`);
  console.log(`Built the demo to ${buildSite().outDir}`);
}
