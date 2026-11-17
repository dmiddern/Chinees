import type { Direction } from "../types";
import type { LearningSession } from "./learningSession";

export type ResultReason = "pinyin" | "writing" | "revealed" | "skipped";
export interface PracticeResult {
  wordId: number;
  direction: Direction;
  correct: boolean;
  reason: ResultReason;
  input?: string;
  writingMistakes?: number[];
}
export interface PracticeMistakes {
  id: string;
  direction: Direction;
  wordIds: number[];
  results: PracticeResult[];
}
const LAST_KEY = "chinees.last-practice-mistakes.v1";
export function exerciseKey(session: LearningSession): string {
  return `${session.id || session.date}:${session.direction}:${session.index}:${session.queue[session.index]?.wordId}`;
}
export function writingIsAccepted(mistakes: number[]): boolean {
  return mistakes.length > 0 && mistakes.every(count => Number.isInteger(count) && count >= 0 && count <= 1);
}
export function recordPracticeResult(session: LearningSession, correct: boolean, reason: ResultReason, details: Pick<PracticeResult,"input" | "writingMistakes"> = {}): LearningSession {
  const exercise = session.queue[session.index];
  if (!exercise || session.results?.[session.index]) return session;
  return { ...session, results: { ...session.results, [session.index]: { wordId: exercise.wordId, direction: exercise.direction, correct, reason, ...details } } };
}
export function sessionMistakes(session: LearningSession): PracticeMistakes {
  const results = Object.values(session.results || {}).filter(result => !result.correct);
  return { id: session.id || session.date, direction: session.direction, wordIds: [...new Set(results.map(result => result.wordId))], results };
}
export function saveLastMistakes(session: LearningSession) {
  localStorage.setItem(LAST_KEY, JSON.stringify(sessionMistakes(session)));
}
export function loadLastMistakes(): PracticeMistakes | null {
  try {
    const value = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
    return value && Array.isArray(value.wordIds) && Array.isArray(value.results) ? value : null;
  } catch { return null; }
}
