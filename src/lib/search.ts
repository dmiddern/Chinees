import type { Word } from "../types";

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("nl")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function wordMatchesSearch(word: Word, query: string) {
  const search = normalizeSearch(query);
  if (!search) return true;

  return [word.hanzi, word.pinyin, word.meaningNl]
    .some((value) => normalizeSearch(value).includes(search));
}
