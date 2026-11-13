import { readFileSync } from "node:fs";

const words = JSON.parse(readFileSync(new URL("../src/data/words.json", import.meta.url), "utf8"));
const examples = JSON.parse(readFileSync(new URL("../src/data/hsk1Examples.json", import.meta.url), "utf8"));
const hsk1 = words.filter((word) => word.level === 1);
const expected = new Set(hsk1.map((word) => word.hanzi));
const actual = new Set(Object.keys(examples));
const availableCharacters = new Set(hsk1.flatMap((word) => [...word.hanzi]));
const errors = [];

const toneOf = (syllable) => {
  const normalized = syllable.normalize("NFD");
  if (normalized.includes("\u0304")) return 1;
  if (normalized.includes("\u0301")) return 2;
  if (normalized.includes("\u030c")) return 3;
  if (normalized.includes("\u0300")) return 4;
  return 5;
};

const syllableRe = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜv]+)(?:ng|n)?r?/giu;
const erhuaRe = /(?:哪儿|那儿|这儿|一点儿|有点儿|好玩儿|面条儿|点儿)/g;
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
    if (/HSK|valt buiten/i.test(entry.grammar)) errors.push(`Ongewenste niveaureferentie voor ${hanzi}`);
    const chars = [...entry.chinese].filter((char) => /[\u3400-\u9fff]/.test(char));
    const extraChars = new Set(chars.filter((char) => !availableCharacters.has(char)));
    if (extraChars.size > 1) errors.push(`Meer dan één onbekend karakter voor ${hanzi}: ${[...extraChars].join(",")}`);

    if (!Array.isArray(entry.toneNumbers) || entry.toneNumbers.length !== chars.length || entry.toneNumbers.some((tone) => !Number.isInteger(tone) || tone < 1 || tone > 5)) {
      errors.push(`Onjuiste toonuitlijning voor ${hanzi}`);
    }

    const syllables = entry.pinyin.match(syllableRe) || [];
    const erhuaCount = [...entry.chinese.matchAll(erhuaRe)].length;
    // 儿 as a suffix is written as an extra Hanzi, but pronounced in the preceding syllable.
    if (syllables.length !== chars.length - erhuaCount) errors.push(`Pinyin-lettergrepen komen niet overeen voor ${hanzi}: ${entry.pinyin}`);
    const writtenTones = syllables.map(toneOf);
    const predictedTones = (entry.toneNumbers || []).filter((tone, index) => {
      // Compare direct alignment for sentences without erhua; an explicit suffix is neutral.
      return erhuaCount === 0;
    });
    if (!erhuaCount && writtenTones.some((tone, index) => tone !== predictedTones[index])) {
      errors.push(`Pinyin en tooncijfers wijken af voor ${hanzi}`);
    }
  }
}
for (const hanzi of actual) if (!expected.has(hanzi)) errors.push(`Onbekend HSK1-woord: ${hanzi}`);

const sentences = Object.values(examples).flat().map((entry) => entry.chinese);
if (new Set(sentences).size !== sentences.length) errors.push("Dubbele voorbeeldzinnen gevonden");
if (examples["只"]?.[0]?.reading !== "zhī" || examples["只"]?.[1]?.reading !== "zhǐ") errors.push("De twee lezingen van 只 ontbreken");
if (!examples["只"]?.[0]?.pinyin.includes("zhī") || !examples["只"]?.[1]?.pinyin.includes("zhǐ")) errors.push("Onjuiste 只-pinyin");
if (!examples["喂"]?.[0]?.pinyin.startsWith("wéi")) errors.push("Telefonische 喂 moet wéi zijn");
if (!examples["睡觉"]?.[0]?.pinyin.includes("jiào")) errors.push("睡觉 heeft jiào nodig");
if (!examples["觉得"]?.[0]?.pinyin.includes("juéde")) errors.push("觉得 heeft jué nodig");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`HSK1: ${hsk1.length} woorden en ${sentences.length} unieke zinnen, vertalingen, uitleg en uitgesproken tonen gecontroleerd.`);
}
