const STORAGE_KEY = "chinees.custom-lists.v1";

export interface CustomWordList {
  id: string;
  name: string;
  wordIds: number[];
  createdAt: number;
  updatedAt: number;
}

export function loadCustomLists(): CustomWordList[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CustomWordList[];
    return Array.isArray(parsed) ? parsed.filter((list) => list?.id && list?.name && Array.isArray(list.wordIds)) : [];
  } catch {
    return [];
  }
}

export function saveCustomLists(lists: CustomWordList[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function createCustomList(lists: CustomWordList[], name: string): CustomWordList[] {
  const cleanName = name.trim();
  if (!cleanName) return lists;
  const now = Date.now();
  return [
    ...lists,
    {
      id: `list-${now}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      wordIds: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function toggleWordInList(lists: CustomWordList[], listId: string, wordId: number): CustomWordList[] {
  return lists.map((list) => {
    if (list.id !== listId) return list;
    const wordIds = list.wordIds.includes(wordId)
      ? list.wordIds.filter((id) => id !== wordId)
      : [...list.wordIds, wordId];
    return { ...list, wordIds, updatedAt: Date.now() };
  });
}
