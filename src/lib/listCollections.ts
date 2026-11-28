import type { HskLevel, Word } from "../types";
import type { CustomWordList } from "./customLists";

export type ListCategory = "hsk" | "mistakes" | "own";
export interface ListCollection extends CustomWordList { category: ListCategory }
const levels: HskLevel[] = [1, 2, 3, 4, 5, 6, "7-9"];

export function listCollections(words: Word[], lists: CustomWordList[]): ListCollection[] {
  const byLevel = new Map<HskLevel, number[]>(levels.map(level => [level, []]));
  for (const word of words) if (!word.custom) byLevel.get(word.level)?.push(word.id);
  return [
    ...levels.map(level => ({ id: `hsk:${level}`, name: `HSK ${level === "7-9" ? "7–9" : level}`, wordIds: byLevel.get(level)!, createdAt: 0, updatedAt: 0, category: "hsk" as const })),
    ...lists.filter(list => list.mistakeSessionId || list.mistakes?.length).map(list => ({ ...list, category: "mistakes" as const })),
    ...lists.filter(list => !list.mistakeSessionId && !list.mistakes?.length).map(list => ({ ...list, category: "own" as const })),
  ];
}
