const asyncHandler = require("express-async-handler");
const Color = require("../models/Color.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createColor = asyncHandler(async (req, res) => {
  try {
    const color = await Color.create(req.body);
    res.status(201).json(color);
  } catch (error) {
    console.error("ERROR [CREATE_COLOR]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const color = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!color) {
      return res.status(404).json({
        message: "Color not found",
      });
    }
    res.status(200).json(color);
  } catch (error) {
    console.error("ERROR [UPDATE_COLOR]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const color = await Color.findByIdAndDelete(id);
    if (!color) {
      return res.status(404).json({
        message: "Color not found",
      });
    }
    res.status(200).json(color);
  } catch (error) {
    console.error("ERROR [DELETE_COLOR]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const color = await Color.findById(id);
    if (!color) {
      return res.status(404).json({
        message: "Color not found",
      });
    }
    res.status(200).json(color);
  } catch (error) {
    console.error("ERROR [GET_COLOR]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllColors = asyncHandler(async (req, res) => {
  try {
    const colors = await Color.find({});
    res.status(200).json(colors);
  } catch (error) {
    console.error("ERROR [GET_ALL_COLORS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getAllColors,
};
