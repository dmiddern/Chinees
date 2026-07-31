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

interface IndexedWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  pinyinWords: string[];
  dutchWords: string[];
}

interface SearchQuery {
  normalized: string;
  searchesChinese: boolean;
  usesToneMarks: boolean;
}

const wordIndex = new WeakMap<Word, IndexedWord>();

function indexWord(word: Word): IndexedWord {
  const cached = wordIndex.get(word);
  if (cached) return cached;

  const indexed = {
    hanzi: normalizeSearch(word.hanzi),
    pinyin: normalizeSearch(word.pinyin),
    meaning: normalizeSearch(word.meaningNl),
    pinyinWords: normalizedWords(word.pinyin),
    dutchWords: normalizedWords(word.meaningNl),
  };

  wordIndex.set(word, indexed);
  return indexed;
}

function prepareQuery(query: string): SearchQuery {
  return {
    normalized: normalizeSearch(query),
    searchesChinese: /[\u3400-\u9fff]/u.test(query),
    usesToneMarks: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/iu.test(query),
  };
}

function searchScore(word: Word, query: SearchQuery) {
  const search = query.normalized;
  if (!search) return 0;

  const { hanzi, pinyin, meaning, pinyinWords, dutchWords } = indexWord(word);

  if (query.searchesChinese) {
    if (hanzi === search) return 3000;
    if (hanzi.startsWith(search)) return 2700 - hanzi.length;
    if (hanzi.includes(search)) return 2400 - hanzi.indexOf(search);
    return -1;
  }

  let score = -1;

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

  if (query.usesToneMarks && pinyin.includes(search)) score += 500;
  return score;
}

export function wordMatchesSearch(word: Word, query: string) {
  return searchScore(word, prepareQuery(query)) >= 0;
}

export function searchWords(items: Word[], query: string) {
  const preparedQuery = prepareQuery(query);
  if (!preparedQuery.normalized) return [...items];

  return items
    .map((word, index) => ({ word, index, score: searchScore(word, preparedQuery) }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => {
      const levelA = a.word.level === "7-9" ? 7 : a.word.level;
      const levelB = b.word.level === "7-9" ? 7 : b.word.level;
      return b.score - a.score || levelA - levelB || a.index - b.index;
    })
    .map((result) => result.word);
}
