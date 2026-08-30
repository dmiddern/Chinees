import { wordsData } from "../data/words";
import type { Word } from "../types";

const STORAGE_KEY = "chinese-custom-words-v1";
const CUSTOM_LISTS_STORAGE_KEY = "chinees.custom-lists.v1";
const DAILY_SETS_STORAGE_KEY = "chinees.daily-sets.v1";
const PROGRESS_STORAGE_KEY = "chinees.progress.v1";
const LEARNING_SESSION_STORAGE_KEY = "chinees.learning-session.v1";
const DOUBLE_QUOTE_ARTIFACT = /["“”„‟«»‹›]/u;
const EDGE_DOUBLE_QUOTES = /^["“”„‟«»‹›]+|["“”„‟«»‹›]+$/gu;

export interface NewCustomWord {
  hanzi: string;
  pinyin: string;
  meaningNl: string;
}

export interface BulkAddResult {
  added: number;
  skipped: number;
}

export function cleanImportedField(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(EDGE_DOUBLE_QUOTES, "")
    .trim();
}

function hasQuoteArtifact(word: Pick<NewCustomWord, "hanzi" | "pinyin">) {
  return DOUBLE_QUOTE_ARTIFACT.test(word.hanzi) || DOUBLE_QUOTE_ARTIFACT.test(word.pinyin);
}

function removeWordIdsFromStoredReferences(removedIds: Set<number>) {
  if (!removedIds.size) return;

  try {
    const lists = JSON.parse(window.localStorage.getItem(CUSTOM_LISTS_STORAGE_KEY) || "[]") as Array<{ wordIds?: number[] }>;
    if (Array.isArray(lists)) {
      const cleaned = lists.map((list) => ({
        ...list,
        wordIds: Array.isArray(list.wordIds) ? list.wordIds.filter((id) => !removedIds.has(id)) : [],
      }));
      window.localStorage.setItem(CUSTOM_LISTS_STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch {
    // Een beschadigde lijstopslag mag de woordenopschoning niet blokkeren.
  }

  try {
    const sets = JSON.parse(window.localStorage.getItem(DAILY_SETS_STORAGE_KEY) || "{}") as Record<string, { wordIds?: number[] }>;
    if (sets && typeof sets === "object" && !Array.isArray(sets)) {
      const cleaned = Object.fromEntries(Object.entries(sets).map(([key, set]) => [key, {
        ...set,
        wordIds: Array.isArray(set.wordIds) ? set.wordIds.filter((id) => !removedIds.has(id)) : [],
      }]));
      window.localStorage.setItem(DAILY_SETS_STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch {
    // Een beschadigde daglijstopslag mag de woordenopschoning niet blokkeren.
  }

  try {
    const progress = JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) || "{}") as Record<string, unknown>;
    if (progress && typeof progress === "object" && !Array.isArray(progress)) {
      removedIds.forEach((id) => delete progress[String(id)]);
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // Oude leerresultaten zijn niet essentieel voor de woordenopschoning.
  }

  try {
    const session = JSON.parse(window.localStorage.getItem(LEARNING_SESSION_STORAGE_KEY) || "null") as { wordIds?: number[] } | null;
    if (session?.wordIds?.some((id) => removedIds.has(id))) {
      window.localStorage.removeItem(LEARNING_SESSION_STORAGE_KEY);
    }
  } catch {
    window.localStorage.removeItem(LEARNING_SESSION_STORAGE_KEY);
  }
}

export function loadCustomWords(): Word[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Word[];
    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter((word) => word?.hanzi && word?.pinyin && word?.meaningNl);
    const malformed = valid.filter((word) => hasQuoteArtifact(word));
    if (malformed.length) {
      const removedIds = new Set(malformed.map((word) => word.id));
      const cleaned = valid.filter((word) => !removedIds.has(word.id));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      removeWordIdsFromStoredReferences(removedIds);
      return cleaned.map((word) => ({
        ...word,
        level: 1,
        custom: true,
        source: "custom",
      }));
    }

    return valid.map((word) => ({
      ...word,
      level: 1,
      custom: true,
      source: "custom",
    }));
  } catch {
    return [];
  }
}

function normalize(input: NewCustomWord): NewCustomWord {
  return {
    hanzi: cleanImportedField(input.hanzi),
    pinyin: cleanImportedField(input.pinyin),
    meaningNl: cleanImportedField(input.meaningNl),
  };
}

function wordKey(word: Pick<NewCustomWord, "hanzi" | "pinyin">) {
  return `${cleanImportedField(word.hanzi)}\u0000${cleanImportedField(word.pinyin).toLocaleLowerCase()}`;
}

const hskHanzi = new Set((wordsData as Word[]).map((word) => cleanImportedField(word.hanzi)));

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

    // Eerst normaliseren, inclusief rechte en typografische aanhalingstekens.
    // Zo kan een gequote HSK-woord de ingebouwde HSK-controle niet omzeilen.
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
  removeWordIdsFromStoredReferences(new Set([wordId]));

  return true;
}
