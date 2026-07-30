export interface ArticleProgress {
  read: boolean;
  understood: boolean;
  updatedAt: number;
  quizCorrect?: number;
  quizAttempts?: number;
}

export type ArticleProgressMap = Record<string, ArticleProgress>;

const STORAGE_KEY = "chinees-article-progress-v1";

export function loadArticleProgress(): ArticleProgressMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as ArticleProgressMap : {};
  } catch {
    return {};
  }
}

export function saveArticleProgress(progress: ArticleProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateArticleProgress(
  progress: ArticleProgressMap,
  articleId: string,
  patch: Partial<Pick<ArticleProgress, "read" | "understood">>,
): ArticleProgressMap {
  const current = progress[articleId] || { read: false, understood: false, updatedAt: 0 };
  const next = { ...current, ...patch, updatedAt: Date.now() };
  if (next.understood) next.read = true;
  return { ...progress, [articleId]: next };
}

export function recordArticleQuiz(
  progress: ArticleProgressMap,
  articleId: string,
  correct: boolean,
): ArticleProgressMap {
  const current = progress[articleId] || { read: false, understood: false, updatedAt: 0 };
  return {
    ...progress,
    [articleId]: {
      ...current,
      quizCorrect: (current.quizCorrect || 0) + (correct ? 1 : 0),
      quizAttempts: (current.quizAttempts || 0) + 1,
      updatedAt: Date.now(),
    },
  };
}
