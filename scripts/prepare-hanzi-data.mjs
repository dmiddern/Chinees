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
  await Promise.all(wordFiles.map(async (file) => JSON.parse(await fs.readFile(path.join(root, "src/data", file), "utf8"))))
).flat();
const characters = [...new Set(words.flatMap((word) => [...word.hanzi]).filter((character) => /[\u3400-\u9fff]/.test(character)))];
const source = path.join(root, "node_modules/hanzi-writer-data");
const destination = path.join(root, "public/hanzi-data");

await fs.mkdir(destination, { recursive: true });

const resample = (points, count = 8) => {
  if (!points?.length) return [];
  if (points.length === 1) return Array.from({ length: count }, () => points[0]);
  const lengths = [0];
  for (let i = 1; i < points.length; i += 1) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const total = lengths.at(-1) || 1;
  return Array.from({ length: count }, (_, index) => {
    const target = total * index / (count - 1);
    let segment = 1;
    while (segment < lengths.length && lengths[segment] < target) segment += 1;
    const before = Math.max(0, segment - 1);
    const span = (lengths[segment] ?? total) - lengths[before] || 1;
    const ratio = (target - lengths[before]) / span;
    const a = points[before];
    const b = points[Math.min(segment, points.length - 1)];
    return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
  });
};

const normalize = (medians) => {
  const all = medians.flat();
  if (!all.length) return [];
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const scale = Math.max(maxX - minX, maxY - minY) || 1;
  return medians.map((stroke) => resample(stroke).map(([x, y]) => [Number(((x - minX) / scale).toFixed(3)), Number(((maxY - y) / scale).toFixed(3))]));
};

let copied = 0;
const recognitionIndex = [];
for (const character of characters) {
  const candidates = [path.join(source, `${character}.json`), path.join(source, character)];
  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      await fs.writeFile(path.join(destination, `${character}.json`), raw);
      const data = JSON.parse(raw);
      recognitionIndex.push({ character, strokes: normalize(data.medians || []) });
      copied += 1;
      break;
    } catch {
      // Try the next package layout.
    }
  }
}
await fs.writeFile(path.join(destination, "recognition-index.json"), JSON.stringify(recognitionIndex));
console.log(`Prepared ${copied} of ${characters.length} unique characters.`);
