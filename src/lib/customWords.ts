import { wordsData } from "../data/words";
import type { Word } from "../types";

const STORAGE_KEY = "chinese-custom-words-v1";

export interface NewCustomWord {
  hanzi: string;
  pinyin: string;
  meaningNl: string;
}

export interface BulkAddResult {
  added: number;
  skipped: number;
}

export function loadCustomWords(): Word[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Word[];
    return Array.isArray(parsed)
      ? parsed.filter((word) => word?.hanzi && word?.pinyin && word?.meaningNl).map((word) => ({
        ...word,
        level: 1,
        custom: true,
        source: "custom",
      }))
      : [];
  } catch {
    return [];
  }
}

function normalize(input: NewCustomWord): NewCustomWord {
  return {
    hanzi: input.hanzi.trim(),
    pinyin: input.pinyin.trim(),
    meaningNl: input.meaningNl.trim(),
  };
}

function wordKey(word: Pick<NewCustomWord, "hanzi" | "pinyin">) {
  return `${word.hanzi.trim()}\u0000${word.pinyin.trim().toLocaleLowerCase()}`;
}

const hskHanzi = new Set((wordsData as Word[]).map((word) => word.hanzi.trim()));

export function addCustomWords(inputs: NewCustomWord[]): BulkAddResult {
  const current = loadCustomWords();
  const existing = new Set(current.map(wordKey));
  const now = Date.now();
  const addedWords: Word[] = [];
  let skipped = 0;

  inputs.forEach((raw, index) => {
    const input = normalize(raw);
    if (!input.hanzi || !input.pinyin || !input.meaningNl) {
      skipped += 1;
      return;
    }

    // Een woord dat al in eender welk ingebouwd HSK-niveau voorkomt,
    // hoort niet nog eens als eigen woord opgeslagen te worden.
    if (hskHanzi.has(input.hanzi)) {
      skipped += 1;
      return;
    }

    const key = wordKey(input);
    if (existing.has(key)) {
      skipped += 1;
      return;
    }
    existing.add(key);

    addedWords.push({
      id: -(now * 1000 + index + 1),
      level: 1,
      hanzi: input.hanzi,
      pinyin: input.pinyin,
      wordType: "eigen woord",
      meaningNl: input.meaningNl,
      meaningLanguage: "nl",
      example: "",
      notes: "",
      source: "custom",
      custom: true,
    });
  });

  if (addedWords.length) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, ...addedWords]));
  }

  return { added: addedWords.length, skipped };
}

export function addCustomWord(input: NewCustomWord) {
  return addCustomWords([input]).added === 1;
}
