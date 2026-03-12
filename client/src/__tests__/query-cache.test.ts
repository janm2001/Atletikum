import { describe, expect, it } from "vitest";
import {
  prependCachedEntity,
  removeArticleFromDetailCache,
  removeCachedEntity,
  replaceCachedEntity,
  toArticleSummary,
  updateArticleBookmarkInDetail,
  updateArticleBookmarkInList,
} from "../lib/query-cache";
import { ArticleTag } from "../types/Article/article";

const bookmark = {
  isBookmarked: true,
  progressPercent: 65,
  isCompleted: false,
  savedAt: "2024-01-01T00:00:00.000Z",
  lastViewedAt: "2024-01-02T00:00:00.000Z",
};

const article = {
  _id: "article-1",
  title: "Recovery basics",
  summary: "How to recover better.",
  content: "<p>Recover</p>",
  tag: ArticleTag.RECOVERY,
  author: "Coach",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  quiz: [],
  bookmark: {
    isBookmarked: false,
    progressPercent: 10,
    isCompleted: false,
  },
};

describe("query cache helpers", () => {
  describe("replaceCachedEntity", () => {
    it("replaces the matching cached entity", () => {
      const updated = replaceCachedEntity(
        [
          { _id: "one", title: "Old one" },
          { _id: "two", title: "Old two" },
        ],
        { _id: "two", title: "New two" },
      );

      expect(updated).toEqual([
        { _id: "one", title: "Old one" },
        { _id: "two", title: "New two" },
      ]);
    });

    it("leaves unrelated caches unchanged", () => {
      const entities = [{ _id: "one", title: "Only entity" }];
      expect(
        replaceCachedEntity(entities, { _id: "two", title: "Other entity" }),
      ).toBe(entities);
    });
  });

  describe("removeCachedEntity", () => {
    it("removes the matching cached entity", () => {
      expect(
        removeCachedEntity(
          [
            { _id: "one", title: "One" },
            { _id: "two", title: "Two" },
          ],
          "one",
        ),
      ).toEqual([{ _id: "two", title: "Two" }]);
    });
  });

  describe("prependCachedEntity", () => {
    it("prepends the entity and removes stale duplicates", () => {
      expect(
        prependCachedEntity(
          [
            { _id: "one", title: "One" },
            { _id: "two", title: "Old two" },
          ],
          { _id: "two", title: "New two" },
        ),
      ).toEqual([
        { _id: "two", title: "New two" },
        { _id: "one", title: "One" },
      ]);
    });
  });

  describe("article helpers", () => {
    it("creates a summary without quiz data", () => {
      expect(toArticleSummary(article)).not.toHaveProperty("quiz");
    });

    it("updates bookmark state in article lists", () => {
      const articles = [toArticleSummary(article)];

      expect(
        updateArticleBookmarkInList(articles, article._id, bookmark),
      ).toEqual([
        {
          ...toArticleSummary(article),
          bookmark,
        },
      ]);
    });

    it("removes unbookmarked articles from saved lists", () => {
      const articles = [toArticleSummary(article)];

      expect(
        updateArticleBookmarkInList(articles, article._id, bookmark, {
          remove: true,
        }),
      ).toEqual([]);
    });

    it("updates bookmark state in the main detail article and related articles", () => {
      const relatedArticle = {
        ...toArticleSummary(article),
        _id: "article-2",
      };
      const detail = {
        ...article,
        relatedArticles: [relatedArticle, toArticleSummary(article)],
      };

      expect(updateArticleBookmarkInDetail(detail, article._id, bookmark)).toEqual({
        ...detail,
        bookmark,
        relatedArticles: [relatedArticle, { ...toArticleSummary(article), bookmark }],
      });
    });

    it("removes deleted articles from related article lists", () => {
      const detail = {
        ...article,
        relatedArticles: [
          toArticleSummary(article),
          { ...toArticleSummary(article), _id: "article-2" },
        ],
      };

      expect(removeArticleFromDetailCache(detail, article._id)).toBeUndefined();
      expect(removeArticleFromDetailCache(detail, "article-2")).toEqual({
        ...detail,
        relatedArticles: [toArticleSummary(article)],
      });
    });
  });
});
