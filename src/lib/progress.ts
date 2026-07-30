import type { ProgressMap, Skill, SkillProgress, WordProgress } from "../types";

const STORAGE_KEY = "chinees.progress.v1";
const SETTINGS_KEY = "chinees.settings.v1";

export const emptySkill = (): SkillProgress => ({
  status: "new",
  correct: 0,
  incorrect: 0,
  streak: 0,
  dueAt: 0,
});

export const emptyWordProgress = (): WordProgress => ({
  meaning: emptySkill(),
  pronunciation: emptySkill(),
  writing: emptySkill(),
  notes: "",
  favorite: false,
});

export function loadProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadSettings<T>(defaults: T): T {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: unknown) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function reviewSkill(current: SkillProgress, correct: boolean): SkillProgress {
  const now = Date.now();
  const streak = correct ? current.streak + 1 : 0;
  const intervalHours = correct ? [4, 12, 24, 72, 168, 336][Math.min(streak - 1, 5)] : 1;
  const correctCount = current.correct + (correct ? 1 : 0);
  const incorrectCount = current.incorrect + (correct ? 0 : 1);
  const attempts = correctCount + incorrectCount;
  const accuracy = attempts ? correctCount / attempts : 0;
  const status = streak >= 4 && accuracy >= 0.75 ? "known" : attempts ? "learning" : "new";

  return {
    status,
    correct: correctCount,
    incorrect: incorrectCount,
    streak,
    dueAt: now + intervalHours * 60 * 60 * 1000,
    lastReviewedAt: now,
  };
}

export function updateSkill(progress: ProgressMap, wordId: number, skill: Skill, correct: boolean): ProgressMap {
  const word = progress[wordId] || emptyWordProgress();
  return {
    ...progress,
    [wordId]: {
      ...word,
      [skill]: reviewSkill(word[skill], correct),
    },
  };
}

export function skillForDirection(direction: "zh-nl" | "nl-zh"): Skill {
  return direction === "zh-nl" ? "meaning" : "writing";
}

