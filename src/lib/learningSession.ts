import type { Direction, Skill } from "../types";

const STORAGE_KEY = "chinees.learning-session.v1";

export interface LearningExercise {
  wordId: number;
  direction: Direction;
  skill: Skill;
}

export interface LearningSession {
  date: string;
  title?: string;
  direction: Direction;
  wordIds: number[];
  queue: LearningExercise[];
  index: number;
  revealed: boolean;
  promptMode: "character" | "strokes";
  ratings: Partial<Record<Skill, boolean>>;
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export function createLearningSession(
  date: string,
  wordIds: number[],
  title: string | undefined,
  direction: Direction,
): LearningSession {
  const exercises: LearningExercise[] = direction === "zh-nl"
    ? wordIds.map((wordId) => ({ wordId, direction, skill: "meaning" as const }))
    : wordIds.map((wordId) => ({ wordId, direction, skill: "writing" as const }));
  const queue = shuffle(exercises);

  return {
    date,
    title,
    direction,
    wordIds: [...wordIds],
    queue,
    index: 0,
    revealed: false,
    promptMode: "character",
    ratings: {},
  };
}

export function loadLearningSession(): LearningSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as LearningSession | null;
    if (!session || !Array.isArray(session.queue) || !Array.isArray(session.wordIds)) return null;
    if (!session.direction || session.queue.some((exercise) => (
      !exercise.skill || exercise.direction !== session.direction
    ))) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveLearningSession(session: LearningSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function sessionMatches(
  session: LearningSession | null,
  date: string,
  wordIds: number[],
  direction: Direction,
) {
  return session?.date === date
    && session.direction === direction
    && session.wordIds.length === wordIds.length
    && session.wordIds.every((wordId, index) => wordId === wordIds[index]);
}
