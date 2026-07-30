import fs from "node:fs/promises";
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
const words = (
  await Promise.all(
    wordFiles.map(async (file) => JSON.parse(await fs.readFile(path.join(root, "src/data", file), "utf8"))),
  )
).flat();
const characters = [...new Set(words.flatMap((word) => [...word.hanzi]).filter((character) => /[\u3400-\u9fff]/.test(character)))];
const source = path.join(root, "node_modules/hanzi-writer-data");
const destination = path.join(root, "public/hanzi-data");

await fs.mkdir(destination, { recursive: true });

let copied = 0;
for (const character of characters) {
  const candidates = [
    path.join(source, `${character}.json`),
    path.join(source, character),
  ];
  for (const candidate of candidates) {
    try {
      await fs.copyFile(candidate, path.join(destination, `${character}.json`));
      copied += 1;
      break;
    } catch {
      // Try the next package layout.
    }
  }
}

console.log(`Prepared ${copied} of ${characters.length} unique characters.`);
