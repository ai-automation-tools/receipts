// Receipts service worker. Takes the overview's pieces from the popup, splits them into claims,
// fetches each cited page once (logged out, 8 s, 600,000 characters) and scores every claim
// against its cited pages with the shared matcher (ADR-002). The cited pages are the only
// requests it makes (ADR-001): tests/check.test.js records them and fails on any other host.
import { score, splitSentences } from "./matcher.js";

export const TIMEOUT_MS = 8000;
export const READ_CAP = 600_000;
export const MIN_WORDS = 6;
export const MAX_CLAIMS = 15;

// Each sentence of six or more words is a claim, paired with the web links its piece cited.
export function toClaims(pieces) {
  const claims = [];
  for (const piece of pieces) {
    const links = (piece.links ?? []).filter((l) => /^https?:\/\//.test(l));
    if (!links.length || typeof piece.text !== "string") continue;
    for (const sentence of splitSentences(piece.text)) {
      if (sentence.split(/\s+/).length >= MIN_WORDS) claims.push({ text: sentence, links });
    }
  }
  return claims.slice(0, MAX_CLAIMS);
}

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", deg: "°", times: "×", minus: "−", thinsp: " ",
};
const BLOCK_TAGS =
  /<\/?(?:p|div|li|ul|ol|h[1-6]|br|hr|tr|td|th|table|section|article|header|footer|nav|aside|main|blockquote|pre|figure|figcaption|dt|dd|caption)\b[^>]*>/gi;

// The readable text of an HTML page, one block per line (the matcher splits sentences on lines).
// Regex, not a DOM: service workers have no DOMParser. The text is only ever scored and shown
// with textContent, so a tag this misses can't run.
export function pageText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(head|script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(BLOCK_TAGS, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (entity, dec, hex, name) => {
      if (dec || hex) {
        const code = dec ? Number(dec) : parseInt(hex, 16);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
      }
      return ENTITIES[name.toLowerCase()] ?? entity;
    })
    .replace(/[ \t\f\v\u00a0]+/g, " ")
    .replace(/ ?\n[\s]*/g, "\n")
    .trim();
}

// The cited page's text, or null when it can't be read: an error, a timeout, a non-2xx answer
// or a type other than HTML or plain text (a PDF, an image).
// ponytail: decodes as UTF-8 whatever the charset; read the header's charset if a cited page needs it.
export async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !res.body || (type && !/^(?:text\/html|text\/plain|application\/xhtml\+xml)\b/i.test(type))) {
      return null;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let body = "";
    while (body.length < READ_CAP) {
      const { done, value } = await reader.read();
      if (done) break;
      body += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
    body = body.slice(0, READ_CAP);
    return /^text\/plain/i.test(type) ? body : pageText(body);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const RANK = { found: 0, conflict: 1, "not located": 2, unreachable: 3 };

// Every claim scored against each page it cites; the best status wins, and its page is the
// evidence: { claim, status, passage, figures, url, domain }.
export async function checkClaims(claims) {
  const urls = [...new Set(claims.flatMap((c) => c.links))];
  const pages = new Map(await Promise.all(urls.map(async (url) => [url, await fetchPage(url)])));
  return claims.map((claim) => {
    let best = null;
    for (const url of claim.links) {
      const result = { ...score(claim.text, pages.get(url) ?? ""), url };
      if (!best || RANK[result.status] < RANK[best.status]) best = result;
    }
    return { claim: claim.text, ...best, domain: new URL(best.url).hostname.replace(/^www\./, "") };
  });
}

if (globalThis.chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "check") return; // onMessage only hears this extension's own pages
    checkClaims(toClaims(message.pieces ?? [])).then(sendResponse);
    return true; // answers asynchronously
  });
}
