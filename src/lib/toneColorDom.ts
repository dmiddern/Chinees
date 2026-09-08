import { wordsData } from "../data/words";
import { loadCustomWords } from "./customWords";
import type { Word } from "../types";

type Tone = 1 | 2 | 3 | 4 | 5;

const COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "#449B95",
  2: "#5C6DC2",
  3: "#CD8253",
  4: "#BC4E49",
};

const HANZI = /[\u3400-\u9fff]/;
const PURE_HANZI = /^[\u3400-\u9fff]+$/;
const PINYIN_SYLLABLE = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜv]+)(?:ng|n|r)?[1-5]?/gi;

function toneOfSyllable(syllable: string): Tone {
  const numeric = syllable.match(/([1-5])$/)?.[1];
  if (numeric) return Number(numeric) as Tone;

  const normalized = syllable.normalize("NFD");
  if (normalized.includes("\u0304")) return 1;
  if (normalized.includes("\u0301")) return 2;
  if (normalized.includes("\u030c")) return 3;
  if (normalized.includes("\u0300")) return 4;
  return 5;
}

function cleanPinyin(value: string) {
  return value.replace(/^[^A-Za-zÀ-žüÜ1-5]+|[^A-Za-zÀ-žüÜ1-5]+$/g, "");
}

function pinyinSyllables(pinyin: string, expected: number): string[] {
  const spaced = pinyin
    .trim()
    .split(/[\s'’·-]+/)
    .map(cleanPinyin)
    .filter(Boolean);

  if (spaced.length === expected) return spaced;

  const compact = pinyin.replace(/[\s'’·-]+/g, "");
  PINYIN_SYLLABLE.lastIndex = 0;
  const parsed = compact.match(PINYIN_SYLLABLE)?.map(cleanPinyin).filter(Boolean) || [];
  PINYIN_SYLLABLE.lastIndex = 0;
  return parsed.length === expected ? parsed : spaced;
}

function tonesFor(hanzi: string, pinyin: string): Tone[] | null {
  const characters = [...hanzi].filter((character) => HANZI.test(character));
  const syllables = pinyinSyllables(pinyin, characters.length);
  if (!characters.length || syllables.length !== characters.length) return null;
  return syllables.map(toneOfSyllable);
}

function allWords(): Word[] {
  return [...(wordsData as Word[]), ...loadCustomWords()];
}

function currentLearningWord(words: Word[]): Word | null {
  try {
    const session = JSON.parse(localStorage.getItem("chinees.learning-session.v1") || "null");
    const exercise = session?.queue?.[session.index];
    if (!exercise) return null;
    return words.find((word) => word.id === exercise.wordId) || null;
  } catch {
    return null;
  }
}

function resetOldToneStyling(element: HTMLElement) {
  element.classList.remove("mandarin-tone-solid", "mandarin-tone-gradient");
  element.style.removeProperty("--mandarin-tone-solid-color");
  element.style.removeProperty("--mandarin-tone-gradient");
  element.style.removeProperty("background-image");
  element.style.removeProperty("background-clip");
  element.style.removeProperty("-webkit-background-clip");
  element.style.removeProperty("-webkit-text-fill-color");
}

function paint(element: HTMLElement | null, hanzi: string, pinyin: string) {
  if (!element || !PURE_HANZI.test(hanzi)) return;
  const tones = tonesFor(hanzi, pinyin);
  if (!tones) return;

  const signature = `${hanzi}|${pinyin}|${tones.join("")}`;
  const existing = element.querySelectorAll(":scope > span[data-tone-char]");
  if (element.dataset.tonePaint === signature && existing.length === [...hanzi].length) return;

  resetOldToneStyling(element);
  element.replaceChildren();

  let toneIndex = 0;
  [...hanzi].forEach((character) => {
    const span = document.createElement("span");
    span.dataset.toneChar = "";
    span.textContent = character;
    span.style.display = "inline";

    if (HANZI.test(character)) {
      const tone = tones[toneIndex] || 5;
      toneIndex += 1;
      if (tone !== 5) {
        const color = COLORS[tone];
        span.style.setProperty("color", color, "important");
        span.style.setProperty("-webkit-text-fill-color", color, "important");
      }
    }

    element.append(span);
  });

  element.dataset.tonePaint = signature;
}

function pinyinFromRow(row: HTMLElement) {
  const strong = row.querySelector<HTMLElement>(".word-info strong");
  if (!strong) return "";
  return (strong.childNodes[0]?.textContent || strong.textContent || "")
    .replace("⊕", "")
    .trim();
}

function paintWordsTab() {
  document.querySelectorAll<HTMLElement>(".word-row").forEach((row) => {
    const hanziElement = row.querySelector<HTMLElement>(".word-hanzi");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinFromRow(row);
    if (hanzi && pinyin) paint(hanziElement, hanzi, pinyin);
  });
}

function paintWordSheet() {
  document.querySelectorAll<HTMLElement>(".word-sheet").forEach((sheet) => {
    const hanziElement = sheet.querySelector<HTMLElement>(".sheet-hanzi");
    const pinyinElement = sheet.querySelector<HTMLElement>(".sheet-pinyin");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.trim() || "";
    if (hanzi && pinyin) paint(hanziElement, hanzi, pinyin);
  });
}

function paintLearning(words: Word[]) {
  const word = currentLearningWord(words);
  if (!word) return;
  document.querySelectorAll<HTMLElement>(".flashcard .prompt-hanzi, .flashcard .answer-hanzi").forEach((element) => {
    if (element.textContent?.trim() === word.hanzi) paint(element, word.hanzi, word.pinyin);
  });
}

function paintWriting() {
  document.querySelectorAll<HTMLElement>(".writing-word-heading").forEach((heading) => {
    const hanziElement = heading.querySelector<HTMLElement>(":scope > div > strong");
    const pinyinElement = heading.querySelector<HTMLElement>(":scope > div > span");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.trim() || "";
    if (hanzi && pinyin) paint(hanziElement, hanzi, pinyin);
  });

  document.querySelectorAll<HTMLElement>(".writing-results button").forEach((button) => {
    const hanziElement = button.querySelector<HTMLElement>("strong");
    const info = button.querySelector<HTMLElement>("span")?.textContent || "";
    const pinyin = info.split("·")[0]?.trim() || "";
    const hanzi = hanziElement?.textContent?.trim() || "";
    if (hanzi && pinyin) paint(hanziElement, hanzi, pinyin);
  });
}

function paintUniqueStandalone(words: Word[]) {
  const patterns = new Map<string, Set<string>>();
  words.forEach((word) => {
    const tones = tonesFor(word.hanzi, word.pinyin);
    if (!tones) return;
    const set = patterns.get(word.hanzi) || new Set<string>();
    set.add(`${word.pinyin}\u0000${tones.join("")}`);
    patterns.set(word.hanzi, set);
  });

  document.querySelectorAll<HTMLElement>(".page strong, .page .today-word-hanzi, .page .daily-word-hanzi").forEach((element) => {
    if (element.dataset.tonePaint) return;
    const hanzi = element.textContent?.trim() || "";
    if (!PURE_HANZI.test(hanzi)) return;
    const options = patterns.get(hanzi);
    if (!options || options.size !== 1) return;
    const only = [...options][0];
    const pinyin = only.split("\u0000")[0];
    paint(element, hanzi, pinyin);
  });
}

export function installToneColorDom() {
  let words = allWords();
  let scheduled = false;

  const apply = () => {
    scheduled = false;
    paintWordsTab();
    paintWordSheet();
    paintLearning(words);
    paintWriting();
    paintUniqueStandalone(words);
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  };

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener("storage", () => {
    words = allWords();
    schedule();
  });
  window.addEventListener("focus", schedule);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });

  schedule();
}
