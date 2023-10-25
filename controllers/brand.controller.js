const asyncHandler = require("express-async-handler");
const Brand = require("../models/Brand.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    console.error("ERROR [CREATE_BRAND]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const brand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }
    res.status(200).json(brand);
  } catch (error) {
    console.error("ERROR [UPDATE_BRAND]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }
    res.status(200).json(brand);
  } catch (error) {
    console.error("ERROR [DELETE_BRAND]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }
    res.status(200).json(brand);
  } catch (error) {
    console.error("ERROR [GET_BRAND]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.status(200).json(brands);
  } catch (error) {
    console.error("ERROR [GET_ALL_BRANDS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrands,
};
