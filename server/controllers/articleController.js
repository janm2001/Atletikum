const { Article } = require("../models/Article");

exports.getAllArticles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tag) {
      filter.tag = req.query.tag;
    }
    const articles = await Article.find(filter)
      .select("-content -quiz")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: { articles },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
    }
    res.status(200).json({ status: "success", data: { article } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const newArticle = await Article.create(req.body);
    res.status(201).json({ status: "success", data: { article: newArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedArticle) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
    }
    res
      .status(200)
      .json({ status: "success", data: { article: updatedArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id);
    if (!deletedArticle) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
