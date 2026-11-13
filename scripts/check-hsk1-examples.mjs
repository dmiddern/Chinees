import { readFileSync } from "node:fs";

const words = JSON.parse(readFileSync(new URL("../src/data/words.json", import.meta.url), "utf8"));
const examples = JSON.parse(readFileSync(new URL("../src/data/hsk1Examples.json", import.meta.url), "utf8"));
const hsk1 = words.filter((word) => word.level === 1);
const expected = new Set(hsk1.map((word) => word.hanzi));
const actual = new Set(Object.keys(examples));
const errors = [];

for (const hanzi of expected) {
  const entries = examples[hanzi];
  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`Geen voorbeeld voor ${hanzi}`);
    continue;
  }
  for (const entry of entries) {
    if (![entry.chinese, entry.pinyin, entry.dutch, entry.grammar].every((value) => typeof value === "string" && value.trim())) {
      errors.push(`Onvolledig voorbeeld voor ${hanzi}`);
    }
    if (!entry.chinese.includes(hanzi)) errors.push(`Doelwoord ontbreekt in zin: ${hanzi}`);
    if (entry.pinyin.includes("[") || entry.pinyin.includes("]")) errors.push(`Onbekende pinyin voor ${hanzi}`);
  }
}

for (const hanzi of actual) if (!expected.has(hanzi)) errors.push(`Onbekend HSK1-woord: ${hanzi}`);

const sentences = Object.values(examples).flat().map((example) => example.chinese);
if (new Set(sentences).size !== sentences.length) errors.push("Dubbele voorbeeldzinnen gevonden");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`HSK1: ${hsk1.length} woorden en ${sentences.length} unieke voorbeeldzinnen gecontroleerd.`);
}
