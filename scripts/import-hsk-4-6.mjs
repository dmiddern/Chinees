import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const wordsPath = path.join(root, "src/data/words.json");
const existingWords = JSON.parse(fs.readFileSync(wordsPath, "utf8"));
const sourceFiles = {
  4: "/tmp/hsk4.html",
  5: "/tmp/hsk5.html",
  6: "/tmp/hsk6.html",
};

const expectedCounts = { 4: 1000, 5: 1600, 6: 1800 };
const wordTypes = {
  noun: "zelfstandig naamwoord",
  verb: "werkwoord",
  adjective: "bijvoeglijk naamwoord",
  adverb: "bijwoord",
  pronoun: "voornaamwoord",
  preposition: "voorzetsel",
  conjunction: "voegwoord",
  interjection: "tussenwerpsel",
  auxiliary: "hulpwoord",
  classifier: "maatwoord",
  numeral: "telwoord",
  phrase: "uitdrukking",
};

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#8217;", "’")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function translateWordType(value) {
  return decodeHtml(value)
    .replaceAll("、", "/")
    .split("/")
    .map((part) => {
      const cleaned = part.replace(/[()（）]/g, "").trim().toLowerCase();
      return wordTypes[cleaned] || cleaned;
    })
    .filter(Boolean)
    .join("/");
}

function parseLevel(level) {
  const html = fs.readFileSync(sourceFiles[level], "utf8");
  const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/gs)]
    .map((match) => [...match[1].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((cell) => decodeHtml(cell[1])))
    .filter((cells) => /^\d+$/.test(cells[0] || "") && cells.length >= 4);

  if (rows.length !== expectedCounts[level]) {
    throw new Error(`HSK ${level}: ${rows.length} rijen gevonden, ${expectedCounts[level]} verwacht.`);
  }

  return rows.map((cells, index) => {
    const [, hanzi, pinyin] = cells;
    const wordType = cells.length >= 5 ? cells[3] : "";
    const meaning = cells.length >= 5 ? cells[4] : cells[3];
    return {
      id: existingWords.length + index + 1,
      level,
      hanzi,
      pinyin,
      wordType: translateWordType(wordType),
      meaningNl: meaning,
      meaningLanguage: "en",
      example: "",
      notes: "",
      source: `https://mandarinbean.com/new-hsk-${level}-word-list/`,
    };
  });
}

let nextId = existingWords.length;
for (const level of [4, 5, 6]) {
  const levelWords = parseLevel(level).map((word) => ({ ...word, id: ++nextId }));
  fs.writeFileSync(
    path.join(root, "src/data", `words-hsk${level}.json`),
    `${JSON.stringify(levelWords, null, 2)}\n`,
  );
}

console.log(`HSK 4-6 geïmporteerd: ${nextId - existingWords.length} nieuwe woorden, ${nextId} totaal.`);
