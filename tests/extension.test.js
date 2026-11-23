// The extension's check flow (Slices 3-4): the content script over the saved Google pages, the
// service worker's fetch limits and scoring, the network-recording test (ADR-001), and the popup's
// report. The service worker is imported from a fresh build, so it runs with the copied matcher.
import { before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import { parseHTML } from "linkedom";
import { build } from "../scripts/build.js";
import { flaggedFirst, reportText } from "../src/extension/popup.js";

const extension = new URL("../src/extension/", import.meta.url);
const google = new URL("fixtures/google/", import.meta.url);
const read = (url) => readFileSync(url, "utf8");

// The content script as Chrome runs it: a classic script in a global scope of its own.
const content = { URL, URLSearchParams };
vm.runInNewContext(read(new URL("content.js", extension)), content);
const extract = (html) => JSON.parse(JSON.stringify(content.extractOverview(parseHTML(html).document)));

let sw; // the built service worker module
before(async () => {
  const outDir = join(mkdtempSync(join(tmpdir(), "receipts-")), "extension");
  build(outDir);
  sw = await import(pathToFileURL(join(outDir, "background.js")).href);
});

const pages = readdirSync(google).filter((f) => f.endsWith(".html")).sort();
const expected = JSON.parse(read(new URL("claims.json", google)));

// A fetch stand-in that records every request and answers from a table of URL -> HTML.
function recorder(answers = {}) {
  const requests = [];
  const fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    const body = answers[url];
    if (body === undefined) return new Response("Not found", { status: 404, headers: { "content-type": "text/html" } });
    return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
  };
  return { fetch, requests };
}

test("the content script extracts the same claim/link pairs from every saved Google page", () => {
  assert.deepEqual(Object.keys(expected).sort(), pages, "claims.json needs an entry per saved page");
  for (const page of pages) {
    const overview = extract(read(new URL(page, google)));
    assert.equal(overview.found, true, page);
    const claims = sw.toClaims(overview.pieces);
    assert.ok(claims.length >= 3, `${page}: ${claims.length} claims`);
    assert.deepEqual(claims, expected[page], page);
  }
});

test("it unwraps /url?q= redirects and skips Google's own links", () => {
  const overview = extract(`<div><div role="heading" aria-level="2">AI Overview</div>
    <div>Mars is about 140 million miles from Earth on average.<span aria-hidden="true">NASA +1</span><a href="/url?q=https://science.nasa.gov/mars/facts/&amp;sa=U" aria-label="NASA"></a></div>
    <div>Learn more about <a href="https://support.google.com/websearch?p=ai_overviews">AI Overviews</a> here.</div></div>`);
  assert.deepEqual(overview.pieces, [
    { text: "Mars is about 140 million miles from Earth on average.", links: ["https://science.nasa.gov/mars/facts/"] },
  ]);
});

test("uncited lines go with the next chip, but not across a subheading", () => {
  const overview = extract(`<div><div role="heading" aria-level="2">AI Overview</div>
    <p>This intro line has no citation of its own at all.</p><h3>Travel times</h3>
    <ul><li>Apollo 8 took 69 hours and 8 minutes to reach orbit.</li>
    <li>Apollo 11 took 4 days to land on the Moon.<a href="https://www.space.com/moon"></a></li></ul></div>`);
  assert.deepEqual(overview.pieces, [
    { text: "Apollo 8 took 69 hours and 8 minutes to reach orbit.\nApollo 11 took 4 days to land on the Moon.", links: ["https://www.space.com/moon"] },
  ]);
});

test("a page without an AI Overview, or one citing nothing, gives nothing to check", () => {
  assert.deepEqual(extract("<main><h2>Results</h2><a href='https://example.com/'>Example</a></main>"), { found: false, pieces: [] });
  assert.deepEqual(extract('<div><div role="heading">AI Overview</div><p>No citations here at all, none.</p></div>'), {
    found: true,
    pieces: [],
  });
});

test("claims are sentences of six or more words, at most 15, with web links only", () => {
  const long = Array.from({ length: 20 }, (_, i) => `Claim number ${i} has enough words here.`).join(" ");
  assert.equal(sw.toClaims([{ text: long, links: ["https://a.gov/"] }]).length, sw.MAX_CLAIMS);
  assert.deepEqual(sw.toClaims([{ text: "Too short to check. This one is long enough to check.", links: ["https://a.gov/"] }]), [
    { text: "This one is long enough to check.", links: ["https://a.gov/"] },
  ]);
  assert.deepEqual(sw.toClaims([{ text: "This one is long enough to check.", links: ["javascript:alert(1)"] }]), []);
});

test("pageText keeps the readable text, one block per line, and drops scripts and styles", () => {
  const html = `<html><head><title>T</title><style>p{}</style></head><body><script>track("x")</script>
    <!-- note --><h1>Mars&nbsp;facts</h1><p>Mars is <b>140</b> million miles &amp; more&#8212;on average.</p><ul><li>One</li><li>Two</li></ul></body></html>`;
  assert.equal(sw.pageText(html), "Mars facts\nMars is 140 million miles & more—on average.\nOne\nTwo");
});

test("fetchPage fetches logged out with no referrer, and reads only HTML or plain text", async (t) => {
  const { fetch, requests } = recorder({ "https://a.gov/": "<p>Hello there.</p>" });
  t.mock.method(globalThis, "fetch", fetch);
  assert.equal(await sw.fetchPage("https://a.gov/"), "Hello there.");
  assert.equal(requests[0].init.credentials, "omit");
  assert.equal(requests[0].init.referrerPolicy, "no-referrer");
  assert.equal(await sw.fetchPage("https://a.gov/missing"), null);

  t.mock.method(globalThis, "fetch", async () => new Response("%PDF-1.7", { headers: { "content-type": "application/pdf" } }));
  assert.equal(await sw.fetchPage("https://a.gov/file.pdf"), null);
  t.mock.method(globalThis, "fetch", async () => Promise.reject(new TypeError("Failed to fetch")));
  assert.equal(await sw.fetchPage("https://a.gov/"), null);
});

test("fetchPage stops reading at 600,000 characters", async (t) => {
  let pulls = 0;
  const chunk = new TextEncoder().encode("word ".repeat(2000)); // 10,000 characters
  t.mock.method(globalThis, "fetch", async () => {
    const body = new ReadableStream({
      pull(controller) {
        if (++pulls > 100) controller.close();
        else controller.enqueue(chunk);
      },
    });
    return new Response(body, { headers: { "content-type": "text/plain" } });
  });
  const text = await sw.fetchPage("https://a.gov/big");
  assert.equal(text.length, sw.READ_CAP);
  assert.ok(pulls < 70, `read ${pulls} chunks`);
});

test("fetchPage gives up after 8 seconds", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", (url, { signal }) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  }));
  const pending = sw.fetchPage("https://slow.example/");
  t.mock.timers.tick(sw.TIMEOUT_MS);
  assert.equal(await pending, null);
});

test("checkClaims takes the best status over a claim's cited pages, with its domain", async (t) => {
  const { fetch } = recorder({
    "https://b.gov/": "<p>Mars is, on average, 150 million miles from Earth.</p>",
    "https://www.c.gov/": "<p>Mars is, on average, 140 million miles from Earth.</p>",
  });
  t.mock.method(globalThis, "fetch", fetch);
  const claim = "Mars is about 140 million miles from Earth on average.";
  const [a, b, c] = await sw.checkClaims([
    { text: claim, links: ["https://a.gov/", "https://b.gov/"] },
    { text: claim, links: ["https://b.gov/", "https://www.c.gov/"] },
    { text: claim, links: ["https://a.gov/"] },
  ]);
  assert.equal(a.status, "conflict");
  assert.equal(a.domain, "b.gov");
  assert.deepEqual(a.figures, [{ claim: "140 million", page: "150 million" }]);
  assert.equal(b.status, "found");
  assert.equal(b.domain, "c.gov");
  assert.equal(c.status, "unreachable");
});

// ADR-001: a check on every saved page requests only the pages its overview cites, each once, logged out.
test("a check contacts no host but the cited pages", async (t) => {
  const marsFacts = read(new URL("fixtures/eval/pages/nasa-mars-facts.txt", import.meta.url));
  const { fetch, requests } = recorder({
    // A stand-in: the sentence Google's source card quotes from this page, with the metric figure.
    "https://www.nasa.gov/hrp/hazard-distance-from-earth/": "<p>Mars is, on average, 140 million miles (225 million kilometers) from Earth.</p>",
    "https://science.nasa.gov/mars/facts/": `<pre>${marsFacts}</pre>`,
  });
  t.mock.method(globalThis, "fetch", fetch);
  for (const page of pages) {
    requests.length = 0;
    const claims = sw.toClaims(extract(read(new URL(page, google))).pieces);
    const results = await sw.checkClaims(claims);
    const cited = new Set(claims.flatMap((c) => c.links));
    assert.ok(requests.length > 0, page);
    for (const { url, init } of requests) {
      assert.ok(cited.has(url), `${page}: requested ${url}, which the overview doesn't cite`);
      assert.equal(init.credentials, "omit", url);
    }
    assert.equal(new Set(requests.map((r) => r.url)).size, requests.length, `${page}: a page was fetched twice`);
    assert.equal(results.length, claims.length);
    if (page === "mars-distance.html") {
      assert.equal(results[0].status, "found");
      assert.equal(results[0].domain, "nasa.gov");
      assert.match(results[0].passage, /140 million miles/);
      assert.equal(results[1].status, "unreachable"); // Britannica answered 404
    }
  }
});

test("no extension script makes a request another way or writes page text as HTML", () => {
  for (const name of readdirSync(extension).filter((f) => f.endsWith(".js"))) {
    const code = read(new URL(name, extension));
    assert.doesNotMatch(code, /XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|\.src\s*=/, name);
    assert.doesNotMatch(code, /innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|document\.write/, name);
    if (name !== "background.js") assert.doesNotMatch(code, /\bfetch\(/, name);
  }
  assert.match(read(new URL("background.js", extension)), /from "\.\/matcher\.js"/); // ADR-002: no copy
});

test("the manifest asks only for the content script on Google search and optional https access", () => {
  const manifest = JSON.parse(read(new URL("manifest.json", extension)));
  assert.deepEqual(manifest.permissions ?? [], []);
  assert.equal(manifest.host_permissions, undefined);
  assert.deepEqual(manifest.optional_host_permissions, ["https://*/*"]);
  assert.deepEqual(manifest.content_scripts.map((c) => [c.matches, c.js]), [[["https://www.google.com/search*"], ["content.js"]]]);
  assert.deepEqual(manifest.background, { service_worker: "background.js", type: "module" });
});

test("the popup lists flagged claims first and copies a plain-text report", () => {
  const results = [
    { claim: "Mars is 140 million miles away on average.", status: "found", passage: "Mars is 140 million miles away.", figures: [], url: "https://nasa.gov/a", domain: "nasa.gov" },
    { claim: "Mars has three small moons, maybe asteroids.", status: "conflict", passage: "Mars has two small moons.", figures: [{ claim: "three", page: "two" }], url: "https://nasa.gov/b", domain: "nasa.gov" },
    { claim: "Mars is mostly made of green cheese inside.", status: "not located", passage: "", figures: [], url: "https://nasa.gov/c", domain: "nasa.gov" },
  ];
  assert.deepEqual(flaggedFirst(results).map((r) => r.status), ["conflict", "not located", "found"]);
  const report = reportText("how far is mars", "2026-11-23", results);
  assert.match(report, /^Receipts check\nQuery: how far is mars\nDate: 2026-11-23\n/);
  assert.match(report, /1\. \[conflict\] Mars has three[\s\S]*Figures: overview says three, page says two/);
  assert.match(report, /2\. \[not located\][\s\S]*No close passage found in the pages Google cited\./);
  assert.match(report, /3\. \[found\][\s\S]*Passage: "Mars is 140 million miles away\."/);
  assert.doesNotMatch(report, /\b(?:true|false)\b/i);
});
