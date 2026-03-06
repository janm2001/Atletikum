const mongoose = require("mongoose");
const ArticleTag = require("../enums/ArticleTag.enum");

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length >= 2, "Pitanje mora imati barem 2 opcije"],
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tag: {
      type: String,
      required: true,
      enum: Object.values(ArticleTag),
    },
    sourceUrl: { type: String, trim: true },
    sourceTitle: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    quiz: [quizQuestionSchema],
    author: { type: String, default: "Atletikum Tim" },
  },
  { timestamps: true },
);

const Article = mongoose.model("Article", articleSchema);

module.exports = { Article, articleSchema };
