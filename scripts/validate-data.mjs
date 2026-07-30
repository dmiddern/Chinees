import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const words = JSON.parse(fs.readFileSync(path.join(root, "src/data/words.json"), "utf8"));
const ids = new Set(words.map((word) => word.id));
const levels = Object.fromEntries([1, 2, 3].map((level) => [level, words.filter((word) => word.level === level).length]));
const characters = [...new Set(words.flatMap((word) => [...word.hanzi]).filter((character) => /[\u3400-\u9fff]/.test(character)))];
const missingHanziData = characters.filter((character) => !fs.existsSync(path.join(root, "public/hanzi-data", `${character}.json`)));
const incomplete = words.filter((word) => !word.hanzi || !word.pinyin || !word.meaningNl || word.meaningLanguage !== "nl");

const checks = {
  totalWords: words.length === 1000,
  levelCounts: levels[1] === 300 && levels[2] === 200 && levels[3] === 500,
  uniqueIds: ids.size === 1000,
  completeDutchRecords: incomplete.length === 0,
  completeStrokeData: missingHanziData.length === 0,
  pwaManifest: fs.existsSync(path.join(root, "public/manifest.webmanifest")),
  serviceWorker: fs.existsSync(path.join(root, "public/sw.js")),
};

console.log(JSON.stringify({ checks, levels, characters: characters.length, incomplete: incomplete.length, missingHanziData }, null, 2));
if (Object.values(checks).some((value) => !value)) process.exit(1);
