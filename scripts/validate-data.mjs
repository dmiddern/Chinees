import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const wordFiles = [
  "words.json",
  "words-hsk4.json",
  "words-hsk5.json",
  "words-hsk6.json",
  "words-hsk7-9-1.json",
  "words-hsk7-9-2.json",
  "words-hsk7-9-3.json",
  "words-hsk7-9-4.json",
];
const words = wordFiles.flatMap((file) => (
  JSON.parse(fs.readFileSync(path.join(root, "src/data", file), "utf8"))
));
const ids = new Set(words.map((word) => word.id));
const expectedLevels = { 1: 300, 2: 200, 3: 500, 4: 1000, 5: 1600, 6: 1800, "7-9": 5605 };
const levels = Object.fromEntries(Object.keys(expectedLevels).map((level) => [
  level,
  words.filter((word) => String(word.level) === level).length,
]));
const characters = [...new Set(words.flatMap((word) => [...word.hanzi]).filter((character) => /[\u3400-\u9fff]/.test(character)))];
const missingHanziData = characters.filter((character) => !fs.existsSync(path.join(root, "public/hanzi-data", `${character}.json`)));
const incomplete = words.filter((word) => !word.hanzi || !word.pinyin || !word.meaningNl || !["nl", "en"].includes(word.meaningLanguage));

const checks = {
  totalWords: words.length === 11005,
  levelCounts: Object.entries(expectedLevels).every(([level, count]) => levels[level] === count),
  uniqueIds: ids.size === 11005,
  completeRecords: incomplete.length === 0,
  completeStrokeData: missingHanziData.length === 0,
  pwaManifest: fs.existsSync(path.join(root, "public/manifest.webmanifest")),
  serviceWorker: fs.existsSync(path.join(root, "public/sw.js")),
};

console.log(JSON.stringify({ checks, levels, characters: characters.length, incomplete: incomplete.length, missingHanziData }, null, 2));
if (Object.values(checks).some((value) => !value)) process.exit(1);
