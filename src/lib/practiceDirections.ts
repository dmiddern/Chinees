import type { Direction, Skill, Word } from "../types";
export const directions: Direction[] = ["zh-nl", "nl-zh", "zh-pinyin", "pinyin-zh", "nl-pinyin", "pinyin-nl"];
export const directionLabels: Record<Direction, string> = { "zh-nl": "Karakters → Nederlands", "nl-zh": "Nederlands → Karakters", "zh-pinyin": "Karakters → Pinyin", "pinyin-zh": "Pinyin → Karakters", "nl-pinyin": "Nederlands → Pinyin", "pinyin-nl": "Pinyin → Nederlands" };
export const isDirection = (value: unknown): value is Direction => directions.includes(value as Direction);
export function directionSkill(direction: Direction): Skill { return direction.endsWith("pinyin") ? "pronunciation" : direction.endsWith("zh") ? "writing" : "meaning"; }
export function promptValue(word: Word, direction: Direction): string { return direction.startsWith("zh-") ? word.hanzi : direction.startsWith("pinyin-") ? word.pinyin : word.meaningNl; }
export function normalizePinyin(value: string): string {
 const marks: Record<string,string> = { "̄": "1", "́": "2", "̌": "3", "̀": "4" };
 const text = value.toLowerCase().replace(/u:/g,"ü").replace(/v/g,"ü").normalize("NFD");
 let plain = "";
 const toneAt = new Map<number,string>();
 for (const c of text) {
   if (c === "̈") plain = plain.slice(0,-1) + "ü";
   else if (marks[c]) toneAt.set(plain.length - 1, marks[c]);
   else plain += c;
 }
 const syllable = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(?:iang|iong|uang|ueng|ang|eng|ing|ong|iao|ian|uai|uan|uen|üe|üan|ün|ai|ei|ao|ou|an|en|ia|ie|iu|in|ua|uo|ui|un|[aeiouü])|[mn](?=[0-5\s'’·-]|$)/gy;
 let result = "", offset = 0;
 while (offset < plain.length) {
   if (/[\s'’·-]/.test(plain[offset])) { offset++; continue; }
   syllable.lastIndex = offset;
   const match = syllable.exec(plain);
   if (!match) return "";
   const end = syllable.lastIndex;
   const tones = [...toneAt].filter(([index]) => index >= offset && index < end).map(([,tone]) => tone);
   if (tones.length > 1) return "";
   let tone = tones[0] || "5";
   offset = end;
   if (/[0-5]/.test(plain[offset] || "!")) {
     const digit = plain[offset++] === "0" ? "5" : plain[offset - 1];
     if (tones.length && digit !== tone) return "";
     tone = digit;
   }
   result += match[0] + tone;
 }
 return result;
}

export function matchingPromptWords(word: Word, direction: Direction, stored: Word[]): Word[] {
 const key = (w: Word) => direction.startsWith("pinyin-") ? normalizePinyin(w.pinyin) : promptValue(w,direction).trim().toLocaleLowerCase("nl");
 return stored.filter(w => key(w) === key(word));
}
function pinyinVariants(text: string): string[] {
  return text.split("/").map(variant => variant.trim()).filter(Boolean);
}

export function checkPinyinAnswer(input: string, word: Word, direction: Direction, stored: Word[]): boolean {
 const answer = normalizePinyin(input);
 return !!answer && matchingPromptWords(word,direction,stored).some(w => pinyinVariants(w.pinyin).some(variant => normalizePinyin(variant) === answer));
}

export function pinyinFeedback(input: string, expected: string[]): { expected: string; details: string[] } {
  const syllables = (text: string) => [...normalizePinyin(text).matchAll(/([a-zü]+)([1-5])/g)].map(match => ({ spelling: match[1], tone: match[2] }));
  const entered = syllables(input);
  // Prefer an alternative with matching spelling before explaining tone differences.
  const ranked = expected.flatMap(pinyinVariants).map(text => {
    const target = syllables(text);
    const score = Math.abs(target.length - entered.length) * 10
      + target.reduce((sum, part, index) => sum + (part.spelling !== entered[index]?.spelling ? 3 : part.tone !== entered[index]?.tone ? 1 : 0), 0);
    return { text, target, score };
  }).sort((a,b) => a.score - b.score);
  const best = ranked[0];
  if (!best) return { expected: "", details: ["Bekijk het juiste antwoord hieronder."] };
  if (!normalizePinyin(input)) return { expected: best.text, details: ["Je invoer is geen herkenbare pinyin. Vergelijk de spelling met het juiste antwoord."] };
  if (entered.length !== best.target.length) return { expected: best.text, details: [`Je antwoord heeft ${entered.length} lettergrepen; het juiste antwoord heeft er ${best.target.length}.`] };
  const toneName = (tone: string) => tone === "5" ? "neutrale toon" : `toon ${tone}`;
  const details: string[] = [];
  best.target.forEach((part,index) => {
    const actual = entered[index];
    if (actual.spelling !== part.spelling) details.push(`Lettergreep ${index + 1}: spelling ‘${actual.spelling}’ → ‘${part.spelling}’.`);
    if (actual.tone !== part.tone) details.push(`Lettergreep ${index + 1} (${part.spelling}): ${toneName(actual.tone)} → ${toneName(part.tone)}.`);
  });
  return { expected: best.text, details };
}
