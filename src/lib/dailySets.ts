import type { HskLevel, ProgressMap, Word } from "../types";

const STORAGE_KEY = "chinees.daily-sets.v1";

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

export function loadDailySets(): DailySetMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as DailySetMap;
  } catch {
    return {};
  }
}

export function saveDailySets(sets: DailySetMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
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
  if (!availableWords.length) return current;
  if (current[date]) {
    if (current[date].wordIds.length <= dailyGoal) return current;
    return {
      ...current,
      [date]: {
        ...current[date],
        wordIds: current[date].wordIds.slice(0, dailyGoal),
      },
    };
  }

  const recentIds = new Set(
    Object.values(current)
      .filter((set) => {
        const age = Date.now() - new Date(`${set.date}T12:00:00`).getTime();
        return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
      })
      .flatMap((set) => set.wordIds),
  );
  const now = Date.now();
  const due = shuffled(availableWords.filter((word) => {
    const item = progress[word.id];
    if (!item) return false;
    const attempts = item.meaning.correct + item.meaning.incorrect
      + item.pronunciation.correct + item.pronunciation.incorrect
      + item.writing.correct + item.writing.incorrect;
    return attempts > 0 && Math.min(item.meaning.dueAt, item.pronunciation.dueAt, item.writing.dueAt) <= now;
  }));
  const unseen = shuffled(availableWords.filter((word) => !progress[word.id] && !recentIds.has(word.id)));
  const dueIds = new Set(due.map((word) => word.id));
  const unseenIds = new Set(unseen.map((word) => word.id));
  const other = shuffled(availableWords.filter((word) => !dueIds.has(word.id) && !unseenIds.has(word.id)));
  const reviewCount = Math.min(due.length, Math.max(1, Math.floor(dailyGoal * 0.3)));
  const selected = [...due.slice(0, reviewCount), ...unseen, ...other]
    .filter((word, index, list) => list.findIndex((item) => item.id === word.id) === index)
    .slice(0, Math.min(dailyGoal, availableWords.length));

  return {
    ...current,
    [date]: {
      date,
      wordIds: selected.map((word) => word.id),
      levels: [...levels],
      createdAt: Date.now(),
    },
  };
}
