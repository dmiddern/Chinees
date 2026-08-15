import { wordsData } from "../data/words";
import type { Word } from "../types";

const STORAGE_KEY = "chinese-custom-words-v1";
const CUSTOM_LISTS_STORAGE_KEY = "chinees.custom-lists.v1";
const CUSTOM_WORDS_RESET_KEY = "chinees.custom-words-reset.2026-08-16";

function clearExistingCustomWordsOnce() {
  try {
    if (window.localStorage.getItem(CUSTOM_WORDS_RESET_KEY)) return;

    const existingWords = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as Word[];
    const customWordIds = new Set(
      Array.isArray(existingWords)
        ? existingWords.filter((word) => word?.custom || word?.source === "custom").map((word) => word.id)
        : [],
    );

    window.localStorage.removeItem(STORAGE_KEY);

    const lists = JSON.parse(window.localStorage.getItem(CUSTOM_LISTS_STORAGE_KEY) || "[]") as Array<{ wordIds?: number[] }>;
    if (Array.isArray(lists) && customWordIds.size) {
      const cleaned = lists.map((list) => ({
        ...list,
        wordIds: Array.isArray(list.wordIds) ? list.wordIds.filter((id) => !customWordIds.has(id)) : [],
      }));
      window.localStorage.setItem(CUSTOM_LISTS_STORAGE_KEY, JSON.stringify(cleaned));
    }

    window.localStorage.setItem(CUSTOM_WORDS_RESET_KEY, "1");
  } catch {
    // Een beschadigde lokale opslag mag het opstarten van de app niet blokkeren.
  }
}

clearExistingCustomWordsOnce();

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

export function deleteCustomWord(wordId: number) {
  const current = loadCustomWords();
  if (!current.some((word) => word.id === wordId)) return false;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(current.filter((word) => word.id !== wordId)),
  );

  // Verwijder het woord ook uit alle eigen woordenlijsten waarin het zat.
  try {
    const lists = JSON.parse(window.localStorage.getItem(CUSTOM_LISTS_STORAGE_KEY) || "[]") as Array<{ wordIds?: number[] }>;
    if (Array.isArray(lists)) {
      const cleaned = lists.map((list) => ({
        ...list,
        wordIds: Array.isArray(list.wordIds) ? list.wordIds.filter((id) => id !== wordId) : [],
      }));
      window.localStorage.setItem(CUSTOM_LISTS_STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch {
    // Het woord zelf is al verwijderd. Een beschadigde lijstopslag mag dit niet blokkeren.
  }

  return true;
}
