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
  // Use Unicode letter/mark classes instead of the old À-ž range.
  // Tone-3 vowels such as ǎ/ǐ/ǒ/ǔ/ǚ live outside that range and were
  // previously stripped, which made e.g. dǎ look like a neutral tone.
  return value
    .normalize("NFC")
    .replace(/^[^\p{L}\p{M}1-5]+|[^\p{L}\p{M}1-5]+$/gu, "");
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

function uniqueWordForHanzi(words: Word[], hanzi: string): Word | null {
  const candidates = words.filter((word) => word.hanzi === hanzi);
  if (!candidates.length) return null;
  const pronunciations = new Set(candidates.map((word) => word.pinyin.trim().toLocaleLowerCase()));
  return pronunciations.size === 1 ? candidates[0] : null;
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
  const characters = [...hanzi];
  const existing = [...element.querySelectorAll<HTMLElement>(":scope > span[data-tone-char]")];

  // Do not trust the signature alone. Earlier builds could leave a correctly
  // signed element with one or more characters carrying the wrong colour.
  if (element.dataset.tonePaint === signature && existing.length === characters.length) {
    let toneIndex = 0;
    const spansAreCorrect = existing.every((span, index) => {
      const character = characters[index];
      if (!HANZI.test(character)) return true;
      const expectedTone = tones[toneIndex] || 5;
      toneIndex += 1;
      return span.dataset.tone === String(expectedTone);
    });
    if (spansAreCorrect) return;
  }

  resetOldToneStyling(element);
  element.replaceChildren();

  let toneIndex = 0;
  characters.forEach((character) => {
    const span = document.createElement("span");
    span.dataset.toneChar = "";
    span.textContent = character;
    span.style.display = "inline";

    if (HANZI.test(character)) {
      const tone = tones[toneIndex] || 5;
      toneIndex += 1;
      span.dataset.tone = String(tone);
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
  const storedWord = currentLearningWord(words);

  document.querySelectorAll<HTMLElement>(".flashcard .prompt-hanzi, .flashcard .answer-hanzi").forEach((element) => {
    const hanzi = element.textContent?.trim() || "";
    if (!hanzi || !PURE_HANZI.test(hanzi)) return;

    const visiblePinyin = element.closest(".answer-block")?.querySelector<HTMLElement>(".answer-pinyin")?.textContent?.trim() || "";
    if (visiblePinyin) {
      paint(element, hanzi, visiblePinyin);
      return;
    }

    if (storedWord?.hanzi === hanzi) {
      paint(element, storedWord.hanzi, storedWord.pinyin);
      return;
    }

    const exactWord = uniqueWordForHanzi(words, hanzi);
    if (exactWord) paint(element, exactWord.hanzi, exactWord.pinyin);
  });
}

function paintDailyHistory(words: Word[]) {
  document.querySelectorAll<HTMLElement>(".daily-word-preview").forEach((preview) => {
    const raw = preview.textContent?.trim() || "";
    if (!raw) return;

    const items = raw.split(/\s*·\s*/).map((item) => item.trim()).filter(Boolean);
    const signature = items.join("|");
    if (preview.dataset.tonePreview === signature && preview.querySelector("[data-daily-tone-word]")) return;

    preview.replaceChildren();
    items.forEach((hanzi, index) => {
      if (index > 0) preview.append(document.createTextNode(" · "));
      const span = document.createElement("span");
      span.dataset.dailyToneWord = "";
      span.textContent = hanzi;
      preview.append(span);

      const word = uniqueWordForHanzi(words, hanzi);
      if (word) paint(span, word.hanzi, word.pinyin);
    });
    preview.dataset.tonePreview = signature;
  });
}

function paintListManager(words: Word[]) {
  document.querySelectorAll<HTMLElement>(".list-search-results button, .list-word-rows > div").forEach((row) => {
    const hanziElement = row.querySelector<HTMLElement>("strong");
    const pinyinElement = row.querySelector<HTMLElement>("span");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.trim() || "";
    if (hanzi && pinyin) paint(hanziElement, hanzi, pinyin);
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
    paintDailyHistory(words);
    paintListManager(words);
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
