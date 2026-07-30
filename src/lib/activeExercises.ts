import { normalizeSearch } from "./search";
import { exampleForWord } from "./wordExamples";
import type { ExerciseKind, LearningExercise } from "./learningSession";
import type { Word } from "../types";

export interface ChoiceOption {
  value: string;
  label: string;
}

const punctuationPattern = /[\s\p{P}\p{S}]+/gu;
const chinesePunctuationPattern = /[，。！？、；：“”‘’（）《》…—\s]/gu;

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let state = Math.abs(seed) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((state / 233280) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function comparableChinese(value: string) {
  return value.normalize("NFKC").replace(chinesePunctuationPattern, "");
}

function comparableTranslation(value: string) {
  return normalizeSearch(value)
    .replace(/^(de|het|een|to|the|a|an)/u, "");
}

export function meaningAnswers(word: Word) {
  return unique(
    word.meaningNl
      .split(/[,;/]/u)
      .flatMap((part) => part.split(/\s+(?:of|or)\s+/iu))
      .map((part) => comparableTranslation(part.trim()))
      .filter(Boolean),
  );
}

export function checkActiveAnswer(exercise: LearningExercise, word: Word, answer: string) {
  const example = exampleForWord(word);
  if (exercise.kind === "meaning-input") {
    const input = comparableTranslation(answer);
    return meaningAnswers(word).some((candidate) => (
      input === candidate
      || (input.length >= 4 && candidate.includes(input))
      || (candidate.length >= 4 && input.includes(candidate))
    ));
  }
  if (exercise.kind === "pinyin-input") {
    return normalizeSearch(answer) === normalizeSearch(word.pinyin);
  }
  if (exercise.kind === "hanzi-input" || exercise.kind === "dictation" || exercise.kind === "fill-blank") {
    return comparableChinese(answer) === comparableChinese(word.hanzi);
  }
  if (exercise.kind === "translation-input") {
    return comparableChinese(answer) === comparableChinese(example.chinese);
  }
  return false;
}

export function choiceOptions(exercise: LearningExercise, word: Word, allWords: Word[]): ChoiceOption[] {
  const sameLevel = allWords.filter((candidate) => candidate.level === word.level && candidate.id !== word.id);
  const offset = Math.abs(word.id * 7 + exercise.kind.length);
  const alternatives = seededShuffle(sameLevel, offset).slice(0, 5);
  const correct = exercise.kind === "listening-choice"
    ? { value: String(word.id), label: word.meaningNl }
    : { value: String(word.id), label: word.meaningNl };
  return seededShuffle([
    correct,
    ...alternatives.slice(0, 3).map((candidate) => ({ value: String(candidate.id), label: candidate.meaningNl })),
  ], offset + 17);
}

export function exerciseInstruction(kind: ExerciseKind, meaningLanguage: string) {
  const labels: Record<ExerciseKind, string> = {
    "meaning-choice": `Kies de juiste betekenis in het ${meaningLanguage}.`,
    "meaning-input": `Typ de betekenis in het ${meaningLanguage}.`,
    "pinyin-input": "Typ de uitspraak in pinyin. Toonaccenten en spaties zijn niet verplicht.",
    "listening-choice": `Luister en kies de juiste betekenis in het ${meaningLanguage}.`,
    "hanzi-input": "Typ het Chinese woord dat bij deze betekenis hoort.",
    dictation: "Luister en typ de Chinese karakters.",
    "fill-blank": "Vul het ontbrekende Chinese woord in.",
    "sentence-order": "Tik de delen aan in de juiste volgorde.",
    "translation-input": `Vertaal de zin naar het Chinees. Typ de volledige Chinese zin.`,
  };
  return labels[kind];
}

export function blankSentence(word: Word) {
  const example = exampleForWord(word);
  return example.chinese.includes(word.hanzi)
    ? example.chinese.replace(word.hanzi, "＿＿")
    : `今天我们学习“＿＿”这个词。`;
}

export function sentenceTokens(word: Word, dictionary: Word[]) {
  const sentence = comparableChinese(exampleForWord(word).chinese);
  const vocabulary = unique(dictionary
    .map((item) => item.hanzi)
    .filter((hanzi) => {
      const length = [...hanzi].length;
      return length > 1 && length <= 4 && hanzi !== sentence && sentence.includes(hanzi);
    }))
    .sort((a, b) => [...b].length - [...a].length);
  const tokens: string[] = [];
  let remaining = sentence;
  while (remaining) {
    const match = vocabulary.find((candidate) => remaining.startsWith(candidate));
    if (match) {
      tokens.push(match);
      remaining = remaining.slice(match.length);
    } else {
      const [character, ...rest] = [...remaining];
      tokens.push(character);
      remaining = rest.join("");
    }
  }
  return {
    ordered: tokens,
    shuffled: seededShuffle(tokens.map((token, index) => ({ token, id: `${index}-${token}` })), word.id + 41),
  };
}

export function inputPlaceholder(kind: ExerciseKind) {
  if (kind === "meaning-input") return "Typ de betekenis";
  if (kind === "pinyin-input") return "Bijvoorbeeld: ni hao";
  return "Typ je antwoord";
}

export function cleanSpokenText(value: string) {
  return value.replace(punctuationPattern, " ").trim();
}
