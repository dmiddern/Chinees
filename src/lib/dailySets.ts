import { wordsData } from "../data/words";
import type { HskLevel, ProgressMap, Word } from "../types";

const STORAGE_KEY = "chinees.daily-sets.v1";
const builtInWordsById = new Map<number, Word>((wordsData as Word[]).map((word) => [word.id, word]));

export interface DailySet {
  date: string;
  wordIds: number[];
  levels: HskLevel[];
  createdAt: number;
}

export type DailySetMap = Record<string, DailySet>;

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeDailySets(sets: DailySetMap): DailySetMap {
  let changed = false;
  const cleaned: DailySetMap = {};

  Object.entries(sets).forEach(([key, set]) => {
    if (!set || !Array.isArray(set.wordIds) || !Array.isArray(set.levels)) {
      changed = true;
      return;
    }

    const wordIds = set.wordIds.filter((id) => {
      const word = builtInWordsById.get(id);
      return Boolean(word && !word.custom && set.levels.includes(word.level));
    });

    if (wordIds.length !== set.wordIds.length) changed = true;
    cleaned[key] = { ...set, wordIds };
  });

  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  return cleaned;
}

export function loadDailySets(): DailySetMap {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as DailySetMap;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return sanitizeDailySets(parsed);
  } catch {
    return {};
  }
}

export function saveDailySets(sets: DailySetMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeDailySets(sets)));
}

export function clearDailySets() {
  localStorage.removeItem(STORAGE_KEY);
}

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function createDailySet(
  current: DailySetMap,
  availableWords: Word[],
  levels: HskLevel[],
  dailyGoal: number,
  progress: ProgressMap,
): DailySetMap {
  const date = localDateKey();

  // De daglijst wordt altijd opnieuw begrensd op de gekozen HSK-niveaus.
  // Eigen (+)-woorden en woorden uit andere HSK-niveaus mogen hier nooit in komen,
  // ook niet wanneer een toekomstige caller per ongeluk een te brede pool doorgeeft.
  const pool = availableWords
    .filter((word) => !word.custom && levels.includes(word.level))
    .filter((word, index, all) => all.findIndex((item) => item.id === word.id) === index);

  if (!pool.length) return current;

  // Een gegenereerde daglijst mag nooit een woord bevatten dat al in een
  // eerdere gegenereerde daglijst stond. Meerdere lijsten op dezelfde dag
  // zijn toegestaan en krijgen elk een eigen opslagsleutel.
  const previouslyGeneratedIds = new Set(
    Object.values(current).flatMap((set) => set.wordIds),
  );
  const eligibleWords = pool.filter((word) => !previouslyGeneratedIds.has(word.id));
  if (!eligibleWords.length) return current;

  const now = Date.now();
  const due = shuffled(eligibleWords.filter((word) => {
    const item = progress[word.id];
    if (!item) return false;
    const attempts = item.meaning.correct + item.meaning.incorrect
      + item.pronunciation.correct + item.pronunciation.incorrect
      + item.writing.correct + item.writing.incorrect;
    return attempts > 0 && Math.min(item.meaning.dueAt, item.pronunciation.dueAt, item.writing.dueAt) <= now;
  }));
  const unseen = shuffled(eligibleWords.filter((word) => !progress[word.id]));
  const dueIds = new Set(due.map((word) => word.id));
  const unseenIds = new Set(unseen.map((word) => word.id));
  const other = shuffled(eligibleWords.filter((word) => !dueIds.has(word.id) && !unseenIds.has(word.id)));
  const reviewCount = Math.min(due.length, Math.max(1, Math.floor(dailyGoal * 0.3)));
  const selected = [...due.slice(0, reviewCount), ...unseen, ...other]
    .filter((word, index, list) => list.findIndex((item) => item.id === word.id) === index)
    .slice(0, Math.min(dailyGoal, eligibleWords.length));

  const createdAt = Date.now();
  const storageKey = `${date}:${createdAt}:${Math.random().toString(36).slice(2, 7)}`;
  return {
    ...current,
    [storageKey]: {
      date,
      wordIds: selected.map((word) => word.id),
      levels: [...levels],
      createdAt,
    },
  };
}
