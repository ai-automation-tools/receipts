// The demo's three canned examples, one per status. Each source is an excerpt of a public US
// government page (the same saved text as tests/fixtures/eval/pages/), with its URL and the date
// it was saved. tests/site.test.js checks each one still scores as `expected`.
export const EXAMPLES = [
  {
    expected: "found",
    label: "Apollo moon rocks",
    claim: "Apollo astronauts brought back a total of 842 pounds of lunar rocks and soil to Earth.",
    source:
      "More than 105 robotic spacecraft have been launched to explore the Moon. It is the only celestial body beyond Earth – so far – visited by human beings.\n" +
      "The Moon's weak atmosphere and its lack of liquid water cannot support life as we know it.\n" +
      "Apollo astronauts brought back a total of 842 pounds (382 kilograms) of lunar rocks and soil to Earth. We are still studying them.",
    url: "https://science.nasa.gov/moon/facts/",
    retrieved: "2026-11-06",
  },
  {
    expected: "conflict",
    label: "The moons of Mars",
    claim: "Mars has three small moons, which may be captured asteroids.",
    source:
      "Mars has two small moons, Phobos and Deimos, that may be captured asteroids. They're potato-shaped because they have too little mass for gravity to make them spherical.\n" +
      "The moons get their names from the horses that pulled the chariot of the Greek god of war, Ares (whose Roman counterpart is Mars).",
    url: "https://science.nasa.gov/mars/facts/",
    retrieved: "2026-11-06",
  },
  {
    expected: "not located",
    label: "Salt in the ocean",
    claim: "Ocean water is about 3.5 percent salt by weight on average.",
    source:
      "About 97 percent of Earth's water is in the ocean.\n" +
      "It's hard to imagine, but about 97 percent of the Earth's water can be found in our ocean. Of the tiny percentage that's not in the ocean, about two percent is frozen up in glaciers and ice caps. Less than one percent of all the water on Earth is fresh. A tiny fraction of water exists as water vapor in our atmosphere.",
    url: "https://oceanservice.noaa.gov/facts/oceanwater.html",
    retrieved: "2026-11-06",
  },
];
