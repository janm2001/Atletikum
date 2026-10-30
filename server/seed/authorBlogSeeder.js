require("dotenv").config();
const mongoose = require("mongoose");
const { Article } = require("../models/Article");
const { authorBlogs } = require("../content/authorBlogs");
const { getMongoUri } = require("../config/env");

async function importAuthorBlogs() {
  for (const blog of authorBlogs) await new Article(blog).validate();
  if (!process.argv.includes("--apply")) {
    console.log(`Validated ${authorBlogs.length} author blogs and ${authorBlogs.reduce((sum, blog) => sum + blog.quiz.length, 0)} questions. Use --apply to add them without replacing existing articles.`);
    return;
  }
  await mongoose.connect(getMongoUri(), { serverSelectionTimeoutMS: 8000 });
  try {
    for (const blog of authorBlogs) {
      const existing = await Article.findOne({ $or: [{ _id: blog._id }, { sourceUrl: blog.sourceUrl }] }).select("_id").lean();
      if (existing) { console.log(`Already present, unchanged: ${blog.title}`); continue; }
      await Article.updateOne({ _id: blog._id }, { $setOnInsert: blog }, { upsert: true, runValidators: true });
      console.log(`Added: ${blog.title} (${blog.quiz.length} questions, audience: coaches)`);
    }
  } finally { await mongoose.disconnect(); }
}
importAuthorBlogs().catch(() => {
  console.error("Author blog import failed. Check database connectivity and configuration; existing articles were not replaced.");
  process.exitCode = 1;
});
