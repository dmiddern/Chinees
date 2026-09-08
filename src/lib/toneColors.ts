import { wordsData } from "../data/words";
import { loadCustomWords } from "./customWords";
import type { Word } from "../types";

type Tone = 1 | 2 | 3 | 4 | 5;

type HighlightRegistry = {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => void;
};

type HighlightConstructor = new (...ranges: Range[]) => unknown;

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

const HANZI_RUN = /[\u3400-\u9fff]+/g;
const HANZI_CHAR = /[\u3400-\u9fff]/;

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

function pinyinSyllables(pinyin: string) {
  return pinyin
    .trim()
    .split(/[\s'’·-]+/)
    .map((part) => part.replace(/^[^A-Za-zÀ-žüÜ]+|[^A-Za-zÀ-žüÜ1-5]+$/g, ""))
    .filter(Boolean);
}

function wordTonePattern(word: Word): Tone[] | null {
  const characters = [...word.hanzi].filter((character) => HANZI_CHAR.test(character));
  const syllables = pinyinSyllables(word.pinyin);
  if (!characters.length || characters.length !== syllables.length) return null;
  return syllables.map(toneOfSyllable);
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
  `;
  document.head.append(style);
}

function buildIndex() {
  const allWords = [...(wordsData as Word[]), ...loadCustomWords()];
  const byFirstCharacter = new Map<string, Array<{ hanzi: string; tones: Tone[] }>>();

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
  }

  return byFirstCharacter;
}

function isExcluded(node: Text) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(
    ".brand, .bottom-nav, .stroke-order-preview, .hanzi-practice, .hanzi-quiz, script, style, textarea, input",
  ));
}

function rangesForTone(root: HTMLElement, index: ReturnType<typeof buildIndex>) {
  const result: Record<1 | 2 | 3 | 4, Range[]> = { 1: [], 2: [], 3: [], 4: [] };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const text = node.data;
    if (!isExcluded(node) && HANZI_RUN.test(text)) {
      HANZI_RUN.lastIndex = 0;
      let runMatch: RegExpExecArray | null;
      while ((runMatch = HANZI_RUN.exec(text))) {
        const run = runMatch[0];
        const runStart = runMatch.index;
        let offset = 0;

        while (offset < run.length) {
          const candidates = index.get(run[offset]) || [];
          const match = candidates.find((candidate) => run.startsWith(candidate.hanzi, offset));
          if (!match) {
            offset += 1;
            continue;
          }

          match.tones.forEach((tone, characterIndex) => {
            if (tone === 5) return;
            const range = document.createRange();
            const start = runStart + offset + characterIndex;
            range.setStart(node, start);
            range.setEnd(node, start + 1);
            result[tone].push(range);
          });
          offset += match.hanzi.length;
        }
      }
    }
    HANZI_RUN.lastIndex = 0;
    current = walker.nextNode();
  }

  return result;
}

export function installToneColors() {
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
  const HighlightClass = (globalThis as unknown as { Highlight?: HighlightConstructor }).Highlight;
  const root = document.getElementById("root");
  if (!registry || !HighlightClass || !root) return;

  addToneStyles();
  const index = buildIndex();
  let frame = 0;

  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const ranges = rangesForTone(root, index);
      ([1, 2, 3, 4] as const).forEach((tone) => {
        registry.delete(TONE_NAMES[tone]);
        if (ranges[tone].length) registry.set(TONE_NAMES[tone], new HighlightClass(...ranges[tone]));
      });
    });
  };

  refresh();
  const observer = new MutationObserver(refresh);
  observer.observe(root, { childList: true, subtree: true, characterData: true });
}
