import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFigures, score, splitSentences, stem } from "../src/matcher.js";

test("stem pairs common inflections", () => {
  assert.equal(stem("moving"), stem("moves"));
  assert.equal(stem("miles"), stem("mile"));
  assert.equal(stem("running"), "run");
  assert.equal(stem("species"), stem("species"));
  assert.equal(stem("studies"), "study");
  assert.equal(stem("glass"), "glass");
  assert.equal(stem("the"), "the");
});

test("splitSentences splits on sentence ends and lines, not on decimals or abbreviations", () => {
  const text = "Mars rotates every 24.6 hours. It is red!\nThe U.S. Geological Survey counts water. Ice caps, e.g. in Greenland, are frozen.";
  assert.deepEqual(splitSentences(text), [
    "Mars rotates every 24.6 hours.",
    "It is red!",
    "The U.S. Geological Survey counts water.",
    "Ice caps, e.g. in Greenland, are frozen.",
  ]);
  assert.deepEqual(splitSentences("It launched in Feb. 2009 from Florida. Then it flew."), [
    "It launched in Feb. 2009 from Florida.",
    "Then it flew.",
  ]);
});

test("parseFigures reads values, scales, percents, ranges and number words", () => {
  const pick = (text) => parseFigures(text).map(({ value, unit }) => [value, unit]);
  assert.deepEqual(pick("an average distance of 142 million miles"), [[142e6, "mil"]]);
  assert.deepEqual(pick("approximately 70% of Earth"), [[70, "percent"]]);
  assert.deepEqual(pick("about 97 percent of the water"), [[97, "percent"]]);
  assert.deepEqual(pick("needs 14-17 hours"), [[14, "hour"], [17, "hour"]]);
  assert.deepEqual(pick("7 or more hours"), [[7, "hour"]]);
  assert.deepEqual(pick("as low as -225 degrees"), [[-225, "degr"]]);
  assert.deepEqual(pick("radius of 2,106 miles"), [[2106, "mil"]]);
  assert.deepEqual(pick("Mars has two small moons"), [[2, "small"]]);
  assert.deepEqual(pick("water molecules (H2O)"), []);
  assert.deepEqual(pick("In 1959, a spacecraft"), [[1959, ""]]);
});

const page = [
  "Mars has two small moons, Phobos and Deimos, that may be captured asteroids.",
  "A year on Mars lasts 669.6 sols, which is the same as 687 Earth days.",
  "From this distance, it takes sunlight 13 minutes to travel from the Sun to Mars.",
].join(" ");

test("score finds a claim the page contains and quotes the passage", () => {
  const result = score("A year on Mars lasts 687 Earth days.", page);
  assert.equal(result.status, "found");
  assert.match(result.passage, /669\.6 sols/);
  assert.deepEqual(result.figures, [{ claim: "687", page: "687" }]);
});

test("score reports a figure conflict with the figure on each side", () => {
  const result = score("It takes sunlight 20 minutes to travel from the Sun to Mars.", page);
  assert.equal(result.status, "conflict");
  assert.deepEqual(result.figures, [{ claim: "20", page: "13" }]);
  assert.equal(score("Mars has three small moons that may be captured asteroids.", page).status, "conflict");
});

test("score does not take a figure about something else as a match", () => {
  const text = "Do muscle-strengthening activities on 2 or more days a week. Example 3";
  assert.equal(score("Do muscle-strengthening activities on 3 or more days a week.", text).status, "conflict");
});

test("score says not located for a claim the page doesn't discuss, with no passage", () => {
  assert.deepEqual(score("Perseverance found fossilized microbes in Jezero Crater.", page), {
    status: "not located",
    passage: "",
    figures: [],
  });
});

test("score says unreachable when there is no page text", () => {
  for (const pageText of [null, undefined, "", "  \n "]) {
    assert.equal(score("A year on Mars lasts 687 Earth days.", pageText).status, "unreachable");
  }
});

test("score only ever returns the four status words", () => {
  const allowed = new Set(["found", "conflict", "not located", "unreachable"]);
  for (const claim of ["", "Mars", "toString constructor hasOwnProperty", "2 2 2 2", page]) {
    assert.ok(allowed.has(score(claim, page).status), claim);
  }
});
