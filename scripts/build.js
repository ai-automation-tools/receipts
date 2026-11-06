// Builds the loadable extension: copies src/extension/ to dist/extension/ and checks the
// manifest is Manifest V3. src/matcher.js is copied in beside it, so the extension runs the
// same file the eval scores (ADR-002). Load dist/extension/ in chrome://extensions with "Load unpacked".
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export function build(outDir = join(root, "dist", "extension")) {
  const manifest = JSON.parse(readFileSync(join(root, "src", "extension", "manifest.json"), "utf8"));
  if (manifest.manifest_version !== 3) throw new Error("manifest.json must be Manifest V3");
  rmSync(outDir, { recursive: true, force: true });
  cpSync(join(root, "src", "extension"), outDir, { recursive: true });
  const matcher = join(root, "src", "matcher.js");
  if (existsSync(matcher)) cpSync(matcher, join(outDir, "matcher.js"));
  return { outDir, manifest };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { outDir, manifest } = build();
  console.log(`Built ${manifest.name} ${manifest.version} to ${outDir}`);
}
