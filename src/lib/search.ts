import type { Word } from "../types";

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("nl")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function normalizedWords(value: string) {
  return value
    .toLocaleLowerCase("nl")
    .split(/[\s,;/()[\]·]+/u)
    .map(normalizeSearch)
    .filter(Boolean);
}

function searchScore(word: Word, query: string) {
  const search = normalizeSearch(query);
  if (!search) return 0;

  const searchesChinese = /[\u3400-\u9fff]/u.test(query);
  const usesToneMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/iu.test(query);
  const hanzi = normalizeSearch(word.hanzi);
  const pinyin = normalizeSearch(word.pinyin);
  const meaning = normalizeSearch(word.meaningNl);

  if (searchesChinese) {
    if (hanzi === search) return 3000;
    if (hanzi.startsWith(search)) return 2700 - hanzi.length;
    if (hanzi.includes(search)) return 2400 - hanzi.indexOf(search);
    return -1;
  }

  let score = -1;
  const pinyinWords = normalizedWords(word.pinyin);
  const dutchWords = normalizedWords(word.meaningNl);

  if (pinyin === search) score = Math.max(score, 2200);
  if (pinyinWords.includes(search)) score = Math.max(score, 2150);
  if (pinyin.startsWith(search)) score = Math.max(score, 1850 - pinyin.length);
  if (pinyinWords.some((part) => part.startsWith(search))) score = Math.max(score, 1800);
  if (pinyin.includes(search)) score = Math.max(score, 1250 - pinyin.indexOf(search));

  if (meaning === search) score = Math.max(score, 2100);
  if (dutchWords.includes(search)) score = Math.max(score, 2050);
  if (dutchWords.some((part) => part.startsWith(search))) score = Math.max(score, 1650);
  if (meaning.startsWith(search)) score = Math.max(score, 1550);
  if (meaning.includes(search)) score = Math.max(score, 700 - meaning.indexOf(search));

  if (usesToneMarks && pinyin.includes(search)) score += 500;
  return score;
}

export function wordMatchesSearch(word: Word, query: string) {
  return searchScore(word, query) >= 0;
}

export function searchWords(items: Word[], query: string) {
  const search = normalizeSearch(query);
  if (!search) return [...items];

  return items
    .map((word, index) => ({ word, index, score: searchScore(word, query) }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => {
      const levelA = a.word.level === "7-9" ? 7 : a.word.level;
      const levelB = b.word.level === "7-9" ? 7 : b.word.level;
      return b.score - a.score || levelA - levelB || a.index - b.index;
    })
    .map((result) => result.word);
}
