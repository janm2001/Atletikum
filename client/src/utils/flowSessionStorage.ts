import type { ArticleQuizResult } from "@/types/Article/quiz";
import type { CelebrationState } from "@/types/Celebration/celebration";

const CELEBRATION_STATE_KEY = "atletikum:celebration-state";
const ARTICLE_QUIZ_RESULT_PREFIX = "atletikum:article-quiz-result";

const getSessionStorage = (): Storage | null => {
  try {
    if (!("sessionStorage" in globalThis)) {
      return null;
    }

    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

const readSessionValue = <T>(key: string): T | null => {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
};

const writeSessionValue = (key: string, value: unknown) => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and fall back to in-memory route flow.
  }
};

const removeSessionValue = (key: string) => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
};

const getArticleQuizResultKey = (articleId: string) =>
  `${ARTICLE_QUIZ_RESULT_PREFIX}:${articleId}`;

export const persistCelebrationState = (state: CelebrationState) => {
  writeSessionValue(CELEBRATION_STATE_KEY, state);
};

export const getPersistedCelebrationState = () =>
  readSessionValue<CelebrationState>(CELEBRATION_STATE_KEY);

export const clearPersistedCelebrationState = () => {
  removeSessionValue(CELEBRATION_STATE_KEY);
};

export const persistArticleQuizResult = (
  articleId: string,
  result: ArticleQuizResult,
) => {
  if (!articleId) {
    return;
  }

  writeSessionValue(getArticleQuizResultKey(articleId), result);
};

export const getPersistedArticleQuizResult = (articleId: string) => {
  if (!articleId) {
    return null;
  }

  return readSessionValue<ArticleQuizResult>(getArticleQuizResultKey(articleId));
};

export const clearPersistedArticleQuizResult = (articleId: string) => {
  if (!articleId) {
    return;
  }

  removeSessionValue(getArticleQuizResultKey(articleId));
};
