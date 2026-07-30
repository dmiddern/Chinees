import type { Article, ArticleExercise } from "../data/articles";
import type { Word } from "../types";

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function optionsFor(correct: string, alternatives: string[]) {
  const options = unique([correct, ...alternatives]).slice(0, 3);
  while (options.length < 3) options.push(`Geen van deze ${options.length + 1}`);
  const offset = [...correct].reduce((total, character) => total + character.codePointAt(0)!, 0) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export function exercisesForArticle(article: Article): ArticleExercise[] {
  const exercises = [...(article.exercises || [])];
  const examples = article.examples.filter((example) => example.chinese && example.dutch);

  for (const example of examples) {
    if (exercises.length >= 3) break;
    const options = optionsFor(
      example.dutch,
      examples.filter((candidate) => candidate !== example).map((candidate) => candidate.dutch),
    );
    exercises.push({
      question: `Wat betekent “${example.chinese}”?`,
      options,
      answer: options.indexOf(example.dutch),
      explanation: `${example.chinese} (${example.pinyin}) betekent: ${example.dutch}`,
    });
  }

  if (exercises.length < 3 && article.patterns.length) {
    const pattern = article.patterns[0];
    const options = optionsFor(pattern.meaning, article.patterns.slice(1).map((item) => item.meaning));
    exercises.push({
      question: `Welke uitleg hoort bij het patroon “${pattern.formula}”?`,
      options,
      answer: options.indexOf(pattern.meaning),
      explanation: pattern.meaning,
    });
  }

  return exercises.slice(0, 3);
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
    .sort((a, b) => b.score - a.score || a.word.level - b.word.level || a.word.id - b.word.id)
    .slice(0, limit)
    .map((item) => item.word);
}
