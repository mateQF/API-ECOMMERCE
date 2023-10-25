const asyncHandler = require("express-async-handler");
const BCategory = require("../models/BlogCategory.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await BCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("ERROR [CREATE_BLOG_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await BCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [UPDATE_BLOG_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await BCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [DELETE_BLOG_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await BCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [GET_BLOG_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await BCategory.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("ERROR [GET_ALL_BLOG_CATEGORIES]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
