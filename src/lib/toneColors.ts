import { wordsData } from "../data/words";
import { loadCustomWords } from "./customWords";
import type { Word } from "../types";

type Tone = 1 | 2 | 3 | 4 | 5;

type HighlightRegistry = {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => void;
};

type HighlightConstructor = new (...ranges: Range[]) => unknown;

type ToneEntry = { hanzi: string; tones: Tone[] };
type ToneIndex = {
  byFirstCharacter: Map<string, ToneEntry[]>;
  fallbackByCharacter: Map<string, Tone>;
  exactWords: Map<string, ToneEntry[]>;
};

const TONE_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: "mandarin-tone-1",
  2: "mandarin-tone-2",
  3: "mandarin-tone-3",
  4: "mandarin-tone-4",
};

const TONE_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "#449B95",
  2: "#5C6DC2",
  3: "#CD8253",
  4: "#BC4E49",
};

const EXCLUDED_SELECTOR = ".brand, .bottom-nav, .stroke-order-preview, .hanzi-writer, .mandarin-tone-char, canvas, svg, script, style, textarea, input";
const HANZI_RUN = /[\u3400-\u9fff]+/g;
const HANZI_CHAR = /[\u3400-\u9fff]/;
const PURE_HANZI = /^[\u3400-\u9fff]+$/;
const PINYIN_SYLLABLE = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜv]+)(?:ng|n|r)?[1-5]?/gi;

function toneOfSyllable(syllable: string): Tone {
  const numericTone = syllable.match(/([1-5])$/)?.[1];
  if (numericTone) return Number(numericTone) as Tone;

  const normalized = syllable.normalize("NFD");
  if (normalized.includes("\u0304")) return 1;
  if (normalized.includes("\u0301")) return 2;
  if (normalized.includes("\u030c")) return 3;
  if (normalized.includes("\u0300")) return 4;
  return 5;
}

function cleanPinyinPart(part: string) {
  return part.replace(/^[^A-Za-zÀ-žüÜ1-5]+|[^A-Za-zÀ-žüÜ1-5]+$/g, "");
}

function pinyinSyllables(pinyin: string, expectedCount: number) {
  const separated = pinyin
    .trim()
    .split(/[\s'’·-]+/)
    .map(cleanPinyinPart)
    .filter(Boolean);

  if (separated.length === expectedCount) return separated;

  const compact = pinyin.replace(/[\s'’·-]+/g, "");
  PINYIN_SYLLABLE.lastIndex = 0;
  const parsed = compact.match(PINYIN_SYLLABLE)?.map(cleanPinyinPart).filter(Boolean) || [];
  PINYIN_SYLLABLE.lastIndex = 0;
  if (parsed.length === expectedCount) return parsed;

  return separated;
}

function tonesFromHanziAndPinyin(hanzi: string, pinyin: string): Tone[] | null {
  const characters = [...hanzi].filter((character) => HANZI_CHAR.test(character));
  const syllables = pinyinSyllables(pinyin, characters.length);
  if (!characters.length || characters.length !== syllables.length) return null;
  return syllables.map(toneOfSyllable);
}

function wordTonePattern(word: Word): Tone[] | null {
  return tonesFromHanziAndPinyin(word.hanzi, word.pinyin);
}

function addToneStyles() {
  if (document.getElementById("mandarin-tone-colors")) return;
  const style = document.createElement("style");
  style.id = "mandarin-tone-colors";
  style.textContent = `
    ::highlight(${TONE_NAMES[1]}) { color: ${TONE_COLORS[1]}; }
    ::highlight(${TONE_NAMES[2]}) { color: ${TONE_COLORS[2]}; }
    ::highlight(${TONE_NAMES[3]}) { color: ${TONE_COLORS[3]}; }
    ::highlight(${TONE_NAMES[4]}) { color: ${TONE_COLORS[4]}; }

    .mandarin-tone-solid {
      color: var(--mandarin-tone-solid-color) !important;
      -webkit-text-fill-color: var(--mandarin-tone-solid-color) !important;
    }

    .mandarin-tone-gradient {
      background-image: var(--mandarin-tone-gradient) !important;
      background-repeat: no-repeat !important;
      background-size: 100% 100% !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
      -webkit-text-fill-color: transparent !important;
    }

    .mandarin-tone-char {
      display: inline;
    }
  `;
  document.head.append(style);
}

function buildIndex(): ToneIndex {
  const allWords = [...(wordsData as Word[]), ...loadCustomWords()];
  const byFirstCharacter = new Map<string, ToneEntry[]>();
  const exactWords = new Map<string, ToneEntry[]>();
  const characterToneCounts = new Map<string, Map<Tone, number>>();
  const exactSingleCharacterTone = new Map<string, Tone>();

  for (const word of allWords) {
    const hanzi = [...word.hanzi].filter((character) => HANZI_CHAR.test(character)).join("");
    const tones = wordTonePattern(word);
    if (!hanzi || !tones) continue;

    const first = hanzi[0];
    const bucket = byFirstCharacter.get(first) || [];
    if (!bucket.some((entry) => entry.hanzi === hanzi && entry.tones.join("") === tones.join(""))) {
      bucket.push({ hanzi, tones });
      bucket.sort((a, b) => b.hanzi.length - a.hanzi.length);
      byFirstCharacter.set(first, bucket);
    }

    const exactBucket = exactWords.get(hanzi) || [];
    if (!exactBucket.some((entry) => entry.tones.join("") === tones.join(""))) {
      exactBucket.push({ hanzi, tones });
      exactWords.set(hanzi, exactBucket);
    }

    [...hanzi].forEach((character, index) => {
      const tone = tones[index];
      const counts = characterToneCounts.get(character) || new Map<Tone, number>();
      counts.set(tone, (counts.get(tone) || 0) + 1);
      characterToneCounts.set(character, counts);
    });

    if ([...hanzi].length === 1) exactSingleCharacterTone.set(hanzi, tones[0]);
  }

  const fallbackByCharacter = new Map<string, Tone>();
  characterToneCounts.forEach((counts, character) => {
    if (exactSingleCharacterTone.has(character)) {
      fallbackByCharacter.set(character, exactSingleCharacterTone.get(character)!);
      return;
    }

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length === 1 || ranked[0][1] > ranked[1][1]) {
      fallbackByCharacter.set(character, ranked[0][0]);
    }
  });

  return { byFirstCharacter, fallbackByCharacter, exactWords };
}

function tonesForRun(run: string, index: ToneIndex) {
  const exact = index.exactWords.get(run);
  if (exact?.length === 1) return exact[0].tones;

  const tones: Tone[] = [];
  let offset = 0;

  while (offset < run.length) {
    const candidates = index.byFirstCharacter.get(run[offset]) || [];
    const match = candidates.find((candidate) => run.startsWith(candidate.hanzi, offset));

    if (match) {
      tones.push(...match.tones);
      offset += match.hanzi.length;
      continue;
    }

    tones.push(index.fallbackByCharacter.get(run[offset]) || 5);
    offset += 1;
  }

  return tones;
}

function isExcluded(node: Text) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(EXCLUDED_SELECTOR));
}

function addRange(result: Record<1 | 2 | 3 | 4, Range[]>, node: Text, start: number, tone: Tone) {
  if (tone === 5) return;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, start + 1);
  result[tone].push(range);
}

function rangesForTone(root: HTMLElement, index: ToneIndex) {
  const result: Record<1 | 2 | 3 | 4, Range[]> = { 1: [], 2: [], 3: [], 4: [] };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const text = node.data;

    if (!isExcluded(node)) {
      HANZI_RUN.lastIndex = 0;
      let runMatch: RegExpExecArray | null;
      while ((runMatch = HANZI_RUN.exec(text))) {
        const run = runMatch[0];
        const runStart = runMatch.index;
        const tones = tonesForRun(run, index);
        tones.forEach((tone, characterIndex) => {
          addRange(result, node, runStart + characterIndex, tone);
        });
      }
      HANZI_RUN.lastIndex = 0;
    }

    current = walker.nextNode();
  }

  return result;
}

function clearFallbackStyle(element: HTMLElement) {
  element.classList.remove("mandarin-tone-solid", "mandarin-tone-gradient");
  element.style.removeProperty("--mandarin-tone-solid-color");
  element.style.removeProperty("--mandarin-tone-gradient");
}

function applyFallbackStyle(element: HTMLElement, tones: Tone[]) {
  clearFallbackStyle(element);
  if (!tones.some((tone) => tone !== 5)) return;

  const neutralColor = getComputedStyle(element).color || "rgb(47, 49, 53)";
  const colors = tones.map((tone) => tone === 5 ? neutralColor : TONE_COLORS[tone]);
  const uniqueColors = [...new Set(colors)];

  if (uniqueColors.length === 1) {
    element.style.setProperty("--mandarin-tone-solid-color", uniqueColors[0]);
    element.classList.add("mandarin-tone-solid");
    return;
  }

  const stops: string[] = [];
  colors.forEach((color, index) => {
    const start = (index / colors.length) * 100;
    const end = ((index + 1) / colors.length) * 100;
    stops.push(`${color} ${start}%`, `${color} ${end}%`);
  });

  element.style.setProperty("--mandarin-tone-gradient", `linear-gradient(90deg, ${stops.join(", ")})`);
  element.classList.add("mandarin-tone-gradient");
}

function applySafariFallback(root: HTMLElement, index: ToneIndex) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const elements = new Set<HTMLElement>();

  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const parent = node.parentElement;
    const text = node.data.trim();

    if (
      parent
      && !isExcluded(node)
      && parent.childNodes.length === 1
      && PURE_HANZI.test(text)
    ) {
      elements.add(parent);
    }

    current = walker.nextNode();
  }

  root.querySelectorAll<HTMLElement>(".mandarin-tone-solid, .mandarin-tone-gradient").forEach((element) => {
    if (!elements.has(element)) clearFallbackStyle(element);
  });

  elements.forEach((element) => {
    const hanzi = element.textContent?.trim() || "";
    if (!hanzi) return;
    applyFallbackStyle(element, tonesForRun(hanzi, index));
  });
}

function currentLearningWord(): Word | null {
  try {
    const session = JSON.parse(localStorage.getItem("chinees.learning-session.v1") || "null");
    const exercise = session?.queue?.[session.index];
    if (!exercise) return null;
    const allWords = [...(wordsData as Word[]), ...loadCustomWords()];
    return allWords.find((word) => word.id === exercise.wordId) || null;
  } catch {
    return null;
  }
}

function applyExactWordStyle(element: HTMLElement | null, hanzi: string, pinyin: string, index: ToneIndex) {
  if (!element || !PURE_HANZI.test(hanzi)) return;
  const tones = tonesFromHanziAndPinyin(hanzi, pinyin)
    || index.exactWords.get(hanzi)?.[0]?.tones
    || tonesForRun(hanzi, index);
  applyFallbackStyle(element, tones);
}

function renderExactToneSpans(element: HTMLElement | null, hanzi: string, pinyin: string, index: ToneIndex) {
  if (!element || !hanzi) return;

  const tones = tonesFromHanziAndPinyin(hanzi, pinyin)
    || index.exactWords.get(hanzi)?.[0]?.tones
    || tonesForRun(hanzi, index);
  const characters = [...hanzi];
  const signature = `${hanzi}|${pinyin}|${tones.join("")}`;
  const existingChars = element.querySelectorAll(":scope > .mandarin-tone-char");

  if (element.dataset.mandarinToneSignature === signature && existingChars.length === characters.length) return;

  element.textContent = "";
  let toneIndex = 0;

  characters.forEach((character) => {
    const span = document.createElement("span");
    span.className = "mandarin-tone-char";
    span.textContent = character;

    if (HANZI_CHAR.test(character)) {
      const tone = tones[toneIndex] || 5;
      toneIndex += 1;
      if (tone !== 5) {
        const color = TONE_COLORS[tone];
        span.style.color = color;
        span.style.setProperty("-webkit-text-fill-color", color);
      }
    }

    element.append(span);
  });

  element.dataset.mandarinToneSignature = signature;
  clearFallbackStyle(element);
}

function applyContextualStyles(root: HTMLElement, index: ToneIndex) {
  const learningWord = currentLearningWord();
  if (learningWord) {
    root.querySelectorAll<HTMLElement>(".flashcard .prompt-hanzi, .flashcard .answer-hanzi").forEach((element) => {
      if (element.textContent?.trim() === learningWord.hanzi) {
        applyExactWordStyle(element, learningWord.hanzi, learningWord.pinyin, index);
      }
    });
  }

  root.querySelectorAll<HTMLElement>(".word-row").forEach((row) => {
    const hanziElement = row.querySelector<HTMLElement>(".word-hanzi");
    const pinyinElement = row.querySelector<HTMLElement>(".word-info strong");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.replace("⊕", "").trim() || "";
    if (hanzi && pinyin) renderExactToneSpans(hanziElement, hanzi, pinyin, index);
  });

  root.querySelectorAll<HTMLElement>(".word-sheet").forEach((sheet) => {
    const hanziElement = sheet.querySelector<HTMLElement>(".sheet-hanzi");
    const pinyinElement = sheet.querySelector<HTMLElement>(".sheet-pinyin");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.trim() || "";
    if (hanzi && pinyin) applyExactWordStyle(hanziElement, hanzi, pinyin, index);
  });

  root.querySelectorAll<HTMLElement>(".answer-block").forEach((answer) => {
    const hanziElement = answer.querySelector<HTMLElement>(".answer-hanzi");
    const pinyinElement = answer.querySelector<HTMLElement>(".answer-pinyin");
    const hanzi = hanziElement?.textContent?.trim() || "";
    const pinyin = pinyinElement?.textContent?.trim() || "";
    if (hanzi && pinyin) applyExactWordStyle(hanziElement, hanzi, pinyin, index);
  });
}

export function installToneColors() {
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
  const HighlightClass = (globalThis as unknown as { Highlight?: HighlightConstructor }).Highlight;
  const root = document.body;
  if (!root) return;

  addToneStyles();
  let index = buildIndex();
  let frame = 0;

  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      applySafariFallback(root, index);
      applyContextualStyles(root, index);

      if (registry && HighlightClass) {
        const ranges = rangesForTone(root, index);
        ([1, 2, 3, 4] as const).forEach((tone) => {
          registry.delete(TONE_NAMES[tone]);
          if (ranges[tone].length) registry.set(TONE_NAMES[tone], new HighlightClass(...ranges[tone]));
        });
      }
    });
  };

  refresh();

  const observer = new MutationObserver(refresh);
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  window.addEventListener("storage", () => {
    index = buildIndex();
    refresh();
  });
}
