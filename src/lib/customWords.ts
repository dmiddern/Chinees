import type { Word } from "../types";

const STORAGE_KEY = "chinese-custom-words-v1";

export interface NewCustomWord {
  hanzi: string;
  pinyin: string;
  meaningNl: string;
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

export function addCustomWord(input: NewCustomWord) {
  const current = loadCustomWords();
  const hanzi = input.hanzi.trim();
  const pinyin = input.pinyin.trim();
  const meaningNl = input.meaningNl.trim();
  if (!hanzi || !pinyin || !meaningNl) return false;
  if (current.some((word) => word.hanzi === hanzi && word.pinyin.toLowerCase() === pinyin.toLowerCase())) return false;
  const word: Word = {
    id: -Date.now(),
    level: 1,
    hanzi,
    pinyin,
    wordType: "eigen woord",
    meaningNl,
    meaningLanguage: "nl",
    example: "",
    notes: "",
    source: "custom",
    custom: true,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, word]));
  return true;
}
