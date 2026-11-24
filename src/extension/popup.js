// Receipts popup. Asks the content script for the overview, asks for host access on the first
// Check, hands the overview to the service worker and lists what came back, flagged claims
// first. Page text only ever reaches the popup as textContent.

export const NOTE = {
  found: "The cited page has a matching passage.",
  conflict: "The cited page has a close passage with a different figure.",
  "not located": "No close passage found in the pages Google cited.",
  unreachable: "The pages Google cited couldn't be read.",
};
const MARK = { found: "✓", conflict: "≠", "not located": "?", unreachable: "×" };
const ORDER = { conflict: 0, "not located": 1, unreachable: 2, found: 3 };

export const flaggedFirst = (results) => [...results].sort((a, b) => ORDER[a.status] - ORDER[b.status]);

// Each overview figure the cited passage has a figure for, with that figure.
const compared = (figures) => figures.filter((f) => f.page !== null);

// The plain-text report Copy report puts on the clipboard.
export function reportText(query, date, results) {
  const lines = ["Receipts check", `Query: ${query}`, `Date: ${date}`, ""];
  flaggedFirst(results).forEach((r, i) => {
    lines.push(`${i + 1}. [${r.status}] ${r.claim}`, `   Source: ${r.domain} (${r.url})`);
    if (r.passage) lines.push(`   Passage: "${r.passage}"`);
    for (const f of r.status === "conflict" ? compared(r.figures) : []) {
      lines.push(`   Figures: overview says ${f.claim}, page says ${f.page}`);
    }
    if (!r.passage) lines.push(`   ${NOTE[r.status]}`);
  });
  lines.push("", "Receipts says whether the cited page contains the sentence. It does not judge the claim itself.");
  return lines.join("\n");
}

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function item(r) {
  const li = el("li");
  const head = el("p", "", "status");
  const badge = el("span", "", `badge ${r.status.replace(" ", "-")}`);
  badge.append(`${MARK[r.status]} ${r.status}`);
  head.append(badge, ` · ${r.domain}`);
  li.append(head, el("p", r.claim, "claim"));
  if (r.passage) li.append(el("blockquote", r.passage));
  const figures = r.status === "conflict" ? compared(r.figures) : [];
  if (figures.length) {
    const list = el("ul", "", "figures");
    for (const f of figures) list.append(el("li", `Overview says ${f.claim} · page says ${f.page}`));
    li.append(list);
  }
  if (!r.passage) li.append(el("p", NOTE[r.status]));
  return li;
}

async function init() {
  const message = document.getElementById("message");
  const check = document.getElementById("check");
  const copy = document.getElementById("copy");
  const list = document.getElementById("results");
  const say = (text) => (message.textContent = text);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // No answer means the content script isn't there: not a Google results page.
  const overview = await chrome.tabs.sendMessage(tab.id, { type: "extract" }).catch(() => null);
  if (!overview?.found) return say("This page has no Google AI Overview, so there is nothing to check.");
  if (!overview.pieces.length) return say("This AI Overview cites no pages, so there is nothing to check.");
  say("AI Overview found. Check fetches the pages it cites, logged out, and looks for each claim in them.");
  check.disabled = false;

  let results = [];
  check.addEventListener("click", async () => {
    const granted = await chrome.permissions.request({ origins: ["https://*/*"] }).catch(() => false);
    if (!granted) {
      return say("Nothing was checked. Receipts needs access to the pages Google cited to fetch them. Click Check to be asked again.");
    }
    check.disabled = true;
    copy.hidden = true;
    list.replaceChildren();
    say("Checking the cited pages…");
    results = (await chrome.runtime.sendMessage({ type: "check", pieces: overview.pieces })) ?? [];
    check.disabled = false;
    if (!results.length) return say("The overview has no claim of six or more words with a cited page.");
    const flagged = results.filter((r) => r.status !== "found").length;
    say(`${results.length} claims checked, ${flagged} flagged. Flagged claims are listed first.`);
    list.replaceChildren(...flaggedFirst(results).map(item));
    copy.hidden = false;
  });

  copy.addEventListener("click", async () => {
    const text = reportText(overview.query, new Date().toISOString().slice(0, 10), results);
    await navigator.clipboard.writeText(text).then(
      () => say("Report copied."),
      () => say("Couldn't copy the report."),
    );
  });
}

if (globalThis.chrome?.tabs) init();
