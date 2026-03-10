const mongoose = require("mongoose");

const articleBookmarkSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    isBookmarked: { type: Boolean, default: false },
    savedAt: { type: Date, default: null },
    lastViewedAt: { type: Date, default: null },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

articleBookmarkSchema.index({ user: 1, article: 1 }, { unique: true });
articleBookmarkSchema.index({ user: 1, isBookmarked: 1, savedAt: -1 });

const ArticleBookmark = mongoose.model(
  "ArticleBookmark",
  articleBookmarkSchema,
);

module.exports = { ArticleBookmark, articleBookmarkSchema };
