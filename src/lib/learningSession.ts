import type { PracticeResult } from "./practiceResults";
import { directionSkill, isDirection } from "./practiceDirections";
import type { Direction, Skill } from "../types";

const STORAGE_KEY = "chinees.learning-session.v1";

export interface LearningExercise {
  wordId: number;
  direction: Direction;
  skill: Skill;
}

export interface LearningSession {
  id?: string;
  results?: Record<number, PracticeResult>;
  date: string;
  title?: string;
  direction: Direction;
  wordIds: number[];
  queue: LearningExercise[];
  index: number;
  pendingPinyin?: { key: string; input: string; meaning?: string; writingMistakes?: number[]; answerWordId: number };
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
  const exercises: LearningExercise[] = wordIds.map(wordId => ({ wordId, direction, skill: directionSkill(direction) }));
  const queue = shuffle(exercises);

  return {
    id: crypto.randomUUID(),
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
    if (!isDirection(session.direction) || session.queue.some((exercise) => (
      !exercise.skill || !isDirection(exercise.direction)
    ))) return null;
    // Older versions graded moving past an unanswered card as an incorrect attempt.
    if (session.results) {
      for (const index of Object.keys(session.results).map(Number)) {
        if (session.results[index].reason !== "skipped") continue;
        delete session.results[index];
        if (index === session.index) session.revealed = false;
      }
    }
    return removePendingRepeats(session);
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
  direction?: Direction,
) {
  return session?.date === date
    && (direction === undefined || session.direction === direction)
    && session.wordIds.length === wordIds.length
    && session.wordIds.every((wordId, index) => wordId === wordIds[index]);
}

export function changeLearningDirection(session: LearningSession, direction: Direction): LearningSession {
  if (session.direction === direction) return session;

  let index = session.index;
  while (index < session.queue.length && session.results?.[index]) index += 1;
  const queue = session.queue.map((exercise, position) =>
    position < index || session.results?.[position]
      ? exercise
      : { ...exercise, direction, skill: directionSkill(direction) }
  );
  return { ...session, pendingPinyin: undefined, direction, queue, index, revealed: false, promptMode: "character", ratings: {} };
}

export function advanceLearningSession(session: LearningSession): LearningSession {
  return { ...session, pendingPinyin: undefined, index: session.index + 1, revealed: false, promptMode: "character", ratings: {} };
}

// Older sessions may still contain automatically inserted repeats. Keep past
// results, but remove those repeats from the remaining questions on resume.
export function removePendingRepeats(session: LearningSession): LearningSession {
  const seen = new Set(session.queue.slice(0,session.index).map(exercise => exercise.wordId));
  const queue = session.queue.slice(0,session.index);
  const results = { ...session.results };
  Object.keys(results).forEach(index => { if (Number(index) >= session.index) delete results[Number(index)]; });
  let currentRemoved = false;
  session.queue.slice(session.index).forEach((exercise,offset) => {
    if (seen.has(exercise.wordId)) { if (offset === 0) currentRemoved = true; return; }
    seen.add(exercise.wordId);
    const newIndex = queue.length;
    queue.push(exercise);
    const result = session.results?.[session.index + offset];
    if (result) results[newIndex] = result;
  });
  if (queue.length === session.queue.length) return session;
  return { ...session, queue, results, ...(currentRemoved ? { revealed:false, ratings:{} } : {}) };
}
