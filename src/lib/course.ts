import type { Article, ArticleExercise } from "../data/articles";
import type { HskLevel, Word } from "../types";

function levelOrder(level: HskLevel) {
  return level === "7-9" ? 7 : level;
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function optionsFor(correct: string, alternatives: string[]) {
  const options = unique([correct, ...alternatives]).slice(0, 3);
  if (options.length < 3) return null;
  const offset = [...correct].reduce((total, character) => total + character.codePointAt(0)!, 0) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export function exercisesForArticle(article: Article): ArticleExercise[] {
  const exercises: ArticleExercise[] = [];
  const seen = new Set<string>();
  for (const exercise of article.exercises || []) {
    const key = exercise.question.trim();
    if (!key || seen.has(key) || !Number.isInteger(exercise.answer) ||
        exercise.answer < 0 || exercise.answer >= exercise.options.length ||
        exercise.options.length < 2 ||
        exercise.options.some((option) => !option.trim()) ||
        new Set(exercise.options.map((option) => option.trim())).size !== exercise.options.length) continue;
    seen.add(key);
    exercises.push(exercise);
  }
  // Prefer authored concept questions. Only use unambiguous translation
  // recognition as a fallback; never invent distractors or generic rules.
  const examples = article.examples.filter((example) => example.chinese && example.dutch);
  for (const example of examples) {
    if (exercises.length >= 5) break;
    const question = `Wat betekent “${example.chinese}”?`;
    if (seen.has(question) || examples.some((candidate) =>
      candidate.chinese === example.chinese && candidate.dutch !== example.dutch)) continue;
    const options = optionsFor(
      example.dutch,
      examples.filter((candidate) => candidate.chinese !== example.chinese).map((candidate) => candidate.dutch),
    );
    if (!options) continue;
    seen.add(question);
    exercises.push({
      question,
      options,
      answer: options.indexOf(example.dutch),
      explanation: `${example.chinese} (${example.pinyin}) betekent: ${example.dutch}`,
    });
  }
  return exercises.slice(0, 5);
}

export function relatedWordsForArticle(article: Article, words: Word[], limit = 12): Word[] {
  const chineseText = [
    article.chineseTitle,
    ...article.examples.map((example) => example.chinese),
    ...(article.dialogue || []).map((line) => line.chinese),
    ...article.patterns.map((pattern) => pattern.formula),
  ].join(" ");

  return words
    .map((word) => {
      let score = 0;
      if (article.chineseTitle.includes(word.hanzi)) score += 8;
      for (const example of article.examples) {
        if (example.chinese.includes(word.hanzi)) score += [...word.hanzi].length > 1 ? 5 : 2;
      }
      for (const line of article.dialogue || []) {
        if (line.chinese.includes(word.hanzi)) score += [...word.hanzi].length > 1 ? 4 : 1;
      }
      if (chineseText.includes(word.hanzi) && [...word.hanzi].length > 1) score += 2;
      return { word, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || levelOrder(a.word.level) - levelOrder(b.word.level) || a.word.id - b.word.id)
    .slice(0, limit)
    .map((item) => item.word);
}
