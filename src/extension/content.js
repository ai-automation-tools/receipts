// Receipts content script, on https://www.google.com/search*. Reads the AI Overview: finds it by
// its visible heading, then walks its text in page order and cuts it at each citation chip, so
// every piece of text comes with the links cited right after it. Google often puts one chip after
// a whole list ("Space +4"), so lines with no chip of their own go with the next chip, up to the
// next subheading. One line per block; the service worker splits the pieces into claims with
// the shared matcher's sentence splitter (ADR-002).
// A classic script (content scripts can't be ES modules); tests/content.test.js runs this same
// file over the saved Google pages. It only reads the page: nothing here writes to it.

const HEADING = "AI Overview";
// Elements whose text isn't part of the overview's prose (chip labels sit in aria-hidden spans).
const SKIP = new Set(["BUTTON", "SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG"]);
const HEADINGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const BLOCK = new Set(["P", "DIV", "LI", "UL", "OL", "TABLE", "TR", "TD", "TH", "BLOCKQUOTE", "SECTION", "BR"]);

// The cited page behind a link, with Google's /url?q= redirect unwrapped. Null for Google's own
// links ("Learn more", "View all related links") and anything that isn't http(s).
function citedUrl(href) {
  let url;
  try {
    url = new URL(href, "https://www.google.com/");
  } catch {
    return null;
  }
  if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname === "/url") {
    const target = url.searchParams.get("q") ?? url.searchParams.get("url");
    return target ? citedUrl(target) : null;
  }
  if (!/^https?:$/.test(url.protocol) || /(^|\.)google\.[a-z.]+$/.test(url.hostname)) return null;
  return url.href;
}

function isHeading(el) {
  return el.getAttribute("role") === "heading" && el.textContent.trim() === HEADING;
}

// { found, pieces: [{ text, links }] }. found is false when the page shows no AI Overview.
function extractOverview(doc) {
  const heading = [...doc.querySelectorAll('[role="heading"]')].find(isHeading);
  if (!heading) return { found: false, pieces: [] };
  // The overview is the heading's closest ancestor holding a citation; its answer column, when
  // Google marks one, leaves out the source cards beside it.
  let root = heading.parentElement;
  while (root && ![...root.querySelectorAll("a[href]")].some((a) => citedUrl(a.getAttribute("href")))) {
    root = root.parentElement;
  }
  if (!root) return { found: true, pieces: [] };
  const body = root.querySelector('[data-container-id="main-col"]') ?? root;

  const pieces = [];
  let text = "";
  let links = [];
  let chipped = false; // the last link was a chip (no text of its own), so the piece is done
  const close = () => {
    const lines = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (links.length && lines.length) pieces.push({ text: lines.join("\n"), links });
    text = "";
    links = [];
    chipped = false;
  };
  const walk = (node) => {
    if (node.nodeType === 3) {
      const value = node.nodeValue.replace(/[\u200b-\u200d\u2060\ufeff]/g, "");
      if (!value.trim()) {
        text += value;
        return;
      }
      if (chipped) close(); // text after a chip starts the next piece
      text += value;
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node;
    const tag = el.tagName.toUpperCase();
    if (SKIP.has(tag) || el.getAttribute("aria-hidden") === "true") return;
    // A subheading starts a new group: uncited text before it cited nothing and is dropped.
    if (HEADINGS.has(tag) || el.getAttribute("role") === "heading") return close();
    // A real block (not a display: contents wrapper) is a line of its own.
    const block = BLOCK.has(tag) && !/display:\s*contents/.test(el.getAttribute("style") ?? "");
    if (block) text += "\n";
    const before = text.length;
    for (const child of el.childNodes) walk(child);
    if (tag === "A") {
      // An inline link ("according to the CDC") cites the sentence it sits in; the piece goes on.
      const url = citedUrl(el.getAttribute("href") ?? "");
      if (url && !links.includes(url)) links.push(url);
      if (url && !text.slice(before).trim()) chipped = true;
    }
    // A block that cited something ends its piece; one that didn't waits for the next chip.
    if (block && links.length) close();
    else if (block) text += "\n";
  };
  walk(body);
  close();
  return { found: true, pieces };
}

if (globalThis.chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "extract") return;
    const query = new URLSearchParams(location.search).get("q") ?? "";
    sendResponse({ query, ...extractOverview(document) });
  });
}
