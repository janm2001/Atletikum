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
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function () {
          return this.correctIndex < this.options.length;
        },
        message: "correctIndex mora biti manji od broja opcija",
      },
    },
  },
  { _id: true },
);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    actionSummary: [{ type: String, trim: true }],
    tag: {
      type: String,
      required: true,
      enum: Object.values(ArticleTag),
    },
    sourceUrl: { type: String, trim: true },
    sourceTitle: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    relatedArticleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    relatedExerciseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
      },
    ],
    quiz: [quizQuestionSchema],
    author: { type: String, default: "Atletikum Tim" },
  },
  { timestamps: true },
);

articleSchema.index({ createdAt: -1 });
articleSchema.index({ tag: 1, createdAt: -1 });
articleSchema.index(
  { title: 'text', summary: 'text' },
  { weights: { title: 10, summary: 5 }, name: 'ArticleTextIndex' },
);

const Article = mongoose.model("Article", articleSchema);

module.exports = { Article, articleSchema };
