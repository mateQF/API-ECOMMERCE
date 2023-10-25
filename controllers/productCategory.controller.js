const asyncHandler = require("express-async-handler");
const PCategory = require("../models/ProductCategory.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await PCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("ERROR [CREATE_PRODUCT_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await PCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [UPDATE_PRODUCT_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await PCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [DELETE_PRODUCT_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const category = await PCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("ERROR [GET_PRODUCT_CATEGORY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await PCategory.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("ERROR [GET_ALL_PRODUCT_CATEGORIES]: " + error);
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
