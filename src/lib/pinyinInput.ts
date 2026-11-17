export type PinyinEdit = { value: string; cursor: number };

const vowels: Record<string, string> = {
  a: "aāáǎà", e: "eēéěè", i: "iīíǐì", o: "oōóǒò", u: "uūúǔù", ü: "üǖǘǚǜ",
};
const plainPinyin = (text: string) => text.normalize("NFD").replace(/[\u0304\u0301\u030c\u0300]/g, "").normalize("NFC");

/** Apply a tone to the syllable at the caret, or the syllable immediately before it. */
export function applyPinyinTone(value: string, start: number, end: number, tone: number): PinyinEdit {
  const tokens: { start: number; end: number; text: string }[] = [];
  for (const chunk of value.matchAll(/[\p{L}\p{M}:0-5]+/gu)) {
    const original = chunk[0];
    const plain = plainPinyin(original).toLowerCase();
    // Map keyboard aliases to ü while preserving positions in the original input.
    let spelling = "";
    const positions: number[] = [];
    for (let i = 0; i < plain.length; i++) {
      positions.push(i);
      if (plain.slice(i, i + 2) === "u:") { spelling += "ü"; i++; }
      else spelling += plain[i] === "v" ? "ü" : plain[i];
    }
    positions.push(original.length);
    const syllables = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:iang|iong|uang|ueng|ang|eng|ing|ong|iao|ian|uai|uan|uen|üan|üe|ün|ai|ei|ao|ou|an|en|ia|ie|iu|in|ua|uo|ui|un|[aeiouü])[0-5]?/g;
    for (const match of spelling.matchAll(syllables)) {
      tokens.push({ start: chunk.index + positions[match.index], end: chunk.index + positions[match.index + match[0].length], text: match[0] });
    }
  }
  const selected = start !== end;
  const token = tokens.find(t => selected && t.start < end && t.end > start)
    || tokens.find(t => t.start < start && t.end >= start)
    || tokens.find(t => t.start === start)
    || tokens.filter(t => t.end <= start).at(-1);
  if (!token) return { value, cursor: start };
  let syllable = token.text.replace(/[0-5]/g, "");
  // Standard pinyin placement: a, e, o in ou, otherwise the last vowel.
  let index = syllable.indexOf("a");
  if (index < 0) index = syllable.indexOf("e");
  if (index < 0 && syllable.includes("ou")) index = syllable.indexOf("o");
  if (index < 0) index = Math.max(...Object.keys(vowels).map(v => syllable.lastIndexOf(v)));
  if (index < 0) return { value, cursor: start };
  const mark = vowels[syllable[index]][tone === 5 ? 0 : tone];
  syllable = syllable.slice(0, index) + mark + syllable.slice(index + 1);
  const original = value.slice(token.start, token.end);
  if (original === original.toUpperCase()) syllable = syllable.toUpperCase();
  else if (original[0] === original[0].toUpperCase()) syllable = syllable[0].toUpperCase() + syllable.slice(1);
  return { value: value.slice(0, token.start) + syllable + value.slice(token.end), cursor: token.start + syllable.length };
}

export function applyPinyinUmlaut(value: string, start: number, end: number): PinyinEdit {
  const vowels: Record<string,string> = { u: "ü", ū: "ǖ", ú: "ǘ", ǔ: "ǚ", ù: "ǜ", U: "Ü", Ū: "Ǖ", Ú: "Ǘ", Ǔ: "Ǚ", Ù: "Ǜ" };
  const selected = start !== end;
  const segmentStart = selected ? start : start - (value.slice(0,start).match(/[\p{L}\p{M}0-5]*$/u)?.[0].length || 0);
  const segment = value.slice(segmentStart, selected ? end : start);
  for (let index = segment.length - 1; index >= 0; index--) {
    const replacement = vowels[segment[index]];
    if (replacement) {
      const position = segmentStart + index;
      return { value: value.slice(0,position) + replacement + value.slice(position + 1), cursor: selected ? end : start };
    }
  }
  return { value: value.slice(0,start) + "ü" + value.slice(end), cursor: start + 1 };
}
