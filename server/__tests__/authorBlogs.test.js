const { Article } = require("../models/Article");
const { authorBlogs } = require("../content/authorBlogs");

test("author blogs are complete, adult-oriented and have no unrelated exercises", async () => {
  expect(authorBlogs).toHaveLength(2);
  for (const article of authorBlogs) {
    await expect(new Article(article).validate()).resolves.toBeUndefined();
    expect(article.audience).toBe("coaches");
    expect(article.relatedExerciseIds).toEqual([]);
    expect(article.quiz).toHaveLength(5);
    expect(article.sourceUrl).toMatch(/^https:\/\/app.notion.com\/p\//);
    expect(article.editorialNote).toMatch(/djeci|djecu/);
    expect(article.quiz.every((question) => Number.isInteger(question.correctIndex) && question.correctIndex < question.options.length)).toBe(true);
  }
  expect(new Set(authorBlogs.map((article) => article._id)).size).toBe(2);
});

test("new articles default to adult context until explicitly reviewed for children", () => {
  const article = new Article({ title: "Example", content: "Example", summary: "Example", tag: "TRAINING" });
  expect(article.audience).toBe("coaches");
});
