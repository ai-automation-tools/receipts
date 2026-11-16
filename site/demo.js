// The paste-in demo: runs the shared matcher (ADR-002) on the claim and source in the form. No
// network call. matcher.js isn't kept in site/: `npm run build` copies src/matcher.js beside this
// file in dist/site/. Pasted text is untrusted, so it only ever reaches the page as textContent.
import { score } from "./matcher.js";
import { EXAMPLES } from "./examples.js";

const MEANING = {
  found: "A passage in the source matches the claim.",
  conflict: "The source has a close passage with a different figure.",
  "not located": "No close passage found in the source text. That doesn't mean the claim is wrong.",
  unreachable: "The source text is empty, so there was nothing to check.",
};
const MARK = { found: "✓", conflict: "≠", "not located": "?", unreachable: "×" };

const form = document.getElementById("check");
const claim = document.getElementById("claim");
const source = document.getElementById("source");
const result = document.getElementById("result");
const examples = document.getElementById("examples");

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function show({ status, passage, figures }, origin) {
  const head = el("p", "", "status");
  const badge = el("span", "", `badge ${status.replace(" ", "-")}`);
  badge.append(el("span", MARK[status], "mark"), ` ${status}`);
  head.append(badge, ` ${MEANING[status]}`);
  const parts = [head];
  if (passage) parts.push(el("p", "Closest passage", "label"), el("blockquote", passage));
  const compared = figures.filter((f) => f.page !== null);
  if (compared.length) {
    const list = el("ul", "", "figures");
    for (const f of compared) list.append(el("li", `Claim says ${f.claim} · source says ${f.page}`));
    parts.push(el("p", "Figures", "label"), list);
  }
  if (origin) {
    const link = el("a", new URL(origin.url).hostname);
    link.href = origin.url;
    link.rel = "noopener";
    const note = el("p", "Source: ", "origin");
    note.append(link, `, saved ${origin.retrieved}.`);
    parts.push(note);
  }
  result.replaceChildren(...parts);
}

let current = null; // the canned example in the form, until the user edits it

form.addEventListener("submit", (event) => {
  event.preventDefault();
  show(score(claim.value, source.value), current);
});
form.addEventListener("input", () => {
  current = null;
});

for (const example of EXAMPLES) {
  const button = el("button", example.label);
  button.type = "button";
  button.append(el("span", ` (${example.expected})`, "hint"));
  button.addEventListener("click", () => {
    claim.value = example.claim;
    source.value = example.source;
    current = example;
    show(score(example.claim, example.source), example);
  });
  examples.append(button);
}

// Offline after the first load: sw.js caches the page and its scripts.
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
