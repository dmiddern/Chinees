import type { Article, ArticleExercise } from "../data/articles";
import type { ArticleProgressMap } from "./articleProgress";
import { exercisesForArticle } from "./course";
import type { ProgressMap, Word } from "../types";

const STORAGE_KEY = "chinees.learning-path.v1";

export interface PlacementResult {
  completedAt: number;
  correct: number;
  total: number;
  startOrder: number;
  label: string;
}

export interface LearningPathState {
  placement?: PlacementResult;
}

export interface PlacementQuestion {
  articleId: string;
  articleTitle: string;
  level: string;
  exercise: ArticleExercise;
}

export interface LearningRecommendation {
  article: Article;
  reason: string;
  review: boolean;
}

export function loadLearningPath(): LearningPathState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as LearningPathState;
  } catch {
    return {};
  }
}

export function saveLearningPath(path: LearningPathState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(path));
}

export function placementQuestions(articles: Article[], count = 12): PlacementQuestion[] {
  if (!articles.length) return [];
  const indexes = Array.from({ length: count }, (_, index) => (
    Math.min(articles.length - 1, Math.round(((index + 1) / count) * (articles.length - 1)))
  ));
  return indexes.map((index) => {
    const article = articles[index];
    return {
      articleId: article.id,
      articleTitle: article.title,
      level: article.level,
      exercise: exercisesForArticle(article)[0],
    };
  }).filter((question) => Boolean(question.exercise));
}

export function resultForPlacement(correct: number, total: number, articleCount: number): PlacementResult {
  const ratio = total ? correct / total : 0;
  const bands = [
    { threshold: 0.8, progress: 0.72, label: "Gevorderd" },
    { threshold: 0.58, progress: 0.48, label: "Verdieping" },
    { threshold: 0.32, progress: 0.24, label: "Basis" },
    { threshold: 0, progress: 0, label: "Start" },
  ];
  const band = bands.find((item) => ratio >= item.threshold)!;
  return {
    completedAt: Date.now(),
    correct,
    total,
    startOrder: Math.max(1, Math.round(articleCount * band.progress)),
    label: band.label,
  };
}

const wordIndexes = new WeakMap<Word[], Map<string, Word>>();

function wordIndex(words: Word[]) {
  const existing = wordIndexes.get(words);
  if (existing) return existing;
  const index = new Map(words.map((word) => [word.hanzi, word]));
  wordIndexes.set(words, index);
  return index;
}

function quickRelatedWords(article: Article, words: Word[]) {
  const index = wordIndex(words);
  const found = new Map<number, Word>();
  const texts = [
    article.chineseTitle,
    ...article.examples.map((example) => example.chinese),
    ...(article.dialogue || []).map((line) => line.chinese),
  ];
  for (const text of texts) {
    const characters = [...text].filter((character) => /[\u3400-\u9fff]/u.test(character));
    for (let start = 0; start < characters.length; start += 1) {
      for (let length = 1; length <= 4 && start + length <= characters.length; length += 1) {
        const word = index.get(characters.slice(start, start + length).join(""));
        if (word) found.set(word.id, word);
      }
    }
  }
  return [...found.values()].slice(0, 12);
}

function attemptsForRelatedWords(article: Article, progress: ProgressMap, words: Word[]) {
  const related = quickRelatedWords(article, words);
  return related.reduce((totals, word) => {
    const item = progress[word.id];
    if (!item) return totals;
    for (const skill of [item.meaning, item.pronunciation, item.writing]) {
      totals.correct += skill.correct;
      totals.incorrect += skill.incorrect;
    }
    return totals;
  }, { correct: 0, incorrect: 0 });
}

export function needsTheoryReview(
  article: Article,
  articleProgress: ArticleProgressMap,
  wordProgress: ProgressMap,
  words: Word[],
) {
  const item = articleProgress[article.id];
  if (!item?.read) return false;
  const quizAttempts = item.quizAttempts || 0;
  if (quizAttempts >= 3 && (item.quizCorrect || 0) / quizAttempts < 0.7) return true;
  const related = attemptsForRelatedWords(article, wordProgress, words);
  const attempts = related.correct + related.incorrect;
  return attempts >= 6 && related.incorrect / attempts >= 0.4;
}

export function prerequisiteFor(article: Article, articles: Article[]) {
  const index = articles.findIndex((item) => item.id === article.id);
  return index > 0 ? articles[index - 1] : undefined;
}

export function isArticleUnlocked(
  article: Article,
  articles: Article[],
  progress: ArticleProgressMap,
  path: LearningPathState,
) {
  const prerequisite = prerequisiteFor(article, articles);
  return !prerequisite
    || Boolean(progress[prerequisite.id]?.understood)
    || article.order <= (path.placement?.startOrder || 1);
}

export function learningRecommendation(
  articles: Article[],
  articleProgress: ArticleProgressMap,
  wordProgress: ProgressMap,
  words: Word[],
  path: LearningPathState,
): LearningRecommendation | null {
  const review = articles.find((article) => (
    needsTheoryReview(article, articleProgress, wordProgress, words)
  ));
  if (review) {
    return {
      article: review,
      reason: "Deze les sluit aan bij fouten die in je oefeningen of zelftests terugkomen.",
      review: true,
    };
  }

  const startOrder = path.placement?.startOrder || 1;
  const next = articles.find((article) => (
    article.order >= startOrder
    && !articleProgress[article.id]?.understood
    && isArticleUnlocked(article, articles, articleProgress, path)
  )) || articles.find((article) => !articleProgress[article.id]?.understood);

  if (!next) return null;
  return {
    article: next,
    reason: path.placement
      ? `Past bij je instapniveau ${path.placement.label} en je huidige cursusvoortgang.`
      : "Dit is de eerstvolgende les in de opgebouwde leerlijn.",
    review: false,
  };
}
