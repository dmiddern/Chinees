import type { Direction, Skill } from "../types";

const STORAGE_KEY = "chinees.learning-session.v1";

export type ExerciseKind =
  | "meaning-choice"
  | "meaning-input"
  | "pinyin-input"
  | "listening-choice"
  | "hanzi-input"
  | "dictation"
  | "fill-blank"
  | "sentence-order"
  | "translation-input";

export interface LearningExercise {
  wordId: number;
  direction: Direction;
  skill: Skill;
  kind: ExerciseKind;
  retryCount?: number;
}

export interface LearningSession {
  version: 2;
  date: string;
  title?: string;
  wordIds: number[];
  queue: LearningExercise[];
  index: number;
  revealed: boolean;
  promptMode: "character" | "strokes";
  ratings: Partial<Record<Skill, boolean>>;
  correctCount: number;
  incorrectCount: number;
  retriedCount: number;
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export function createLearningSession(date: string, wordIds: number[], title?: string): LearningSession {
  const meaningKinds: ExerciseKind[] = ["meaning-choice", "meaning-input"];
  const pronunciationKinds: ExerciseKind[] = ["listening-choice", "pinyin-input"];
  const writingKinds: ExerciseKind[] = ["hanzi-input", "dictation"];
  const contextKinds: ExerciseKind[] = ["fill-blank", "sentence-order", "translation-input"];
  const variation = Math.floor(Math.random() * 6);
  const queue = shuffle(
    wordIds.flatMap((wordId, index) => {
      return [
        {
          wordId,
          direction: "zh-nl" as const,
          skill: "meaning" as const,
          kind: meaningKinds[(index + variation) % meaningKinds.length],
        },
        {
          wordId,
          direction: "zh-nl" as const,
          skill: "pronunciation" as const,
          kind: pronunciationKinds[(Math.floor(index / 2) + variation) % pronunciationKinds.length],
        },
        {
          wordId,
          direction: "nl-zh" as const,
          skill: "writing" as const,
          kind: writingKinds[(Math.floor(index / 3) + variation) % writingKinds.length],
        },
        {
          wordId,
          direction: "nl-zh" as const,
          skill: index % 2 ? "meaning" as const : "writing" as const,
          kind: contextKinds[(index + variation) % contextKinds.length],
        },
      ];
    }),
  );

  return {
    version: 2,
    date,
    title,
    wordIds: [...wordIds],
    queue,
    index: 0,
    revealed: false,
    promptMode: "character",
    ratings: {},
    correctCount: 0,
    incorrectCount: 0,
    retriedCount: 0,
  };
}

export function loadLearningSession(): LearningSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as LearningSession | null;
    if (!session || !Array.isArray(session.queue) || !Array.isArray(session.wordIds)) return null;
    if (session.version !== 2 || session.queue.some((exercise) => !exercise.skill || !exercise.kind)) {
      return createLearningSession(session.date, session.wordIds, session.title);
    }
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

export function answerExercise(session: LearningSession, correct: boolean): LearningSession {
  const exercise = session.queue[session.index];
  if (!exercise) return session;
  const shouldRetry = !correct && (exercise.retryCount || 0) < 2;
  return {
    ...session,
    queue: shouldRetry
      ? [...session.queue, { ...exercise, retryCount: (exercise.retryCount || 0) + 1 }]
      : session.queue,
    index: session.index + 1,
    revealed: false,
    promptMode: "character",
    ratings: {},
    correctCount: session.correctCount + (correct ? 1 : 0),
    incorrectCount: session.incorrectCount + (correct ? 0 : 1),
    retriedCount: session.retriedCount + (shouldRetry ? 1 : 0),
  };
}

export function sessionMatches(session: LearningSession | null, date: string, wordIds: number[]) {
  return session?.date === date
    && session.wordIds.length === wordIds.length
    && session.wordIds.every((wordId, index) => wordId === wordIds[index]);
}
