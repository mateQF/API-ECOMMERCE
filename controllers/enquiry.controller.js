const asyncHandler = require("express-async-handler");
const Enquiry = require("../models/Enquiry.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createEnquiry = asyncHandler(async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (error) {
    console.error("ERROR [CREATE_ENQUIRY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateEnquiry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const enquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }
    res.status(200).json(enquiry);
  } catch (error) {
    console.error("ERROR [UPDATE_ENQUIRY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }
    res.status(200).json(enquiry);
  } catch (error) {
    console.error("ERROR [DELETE_ENQUIRY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getEnquiry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }
    res.status(200).json(enquiry);
  } catch (error) {
    console.error("ERROR [GET_ENQUIRY]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllEnquirys = asyncHandler(async (req, res) => {
  try {
    const enquirys = await Enquiry.find({});
    res.status(200).json(enquirys);
  } catch (error) {
    console.error("ERROR [GET_ALL_ENQUIRYS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getAllEnquirys,
};
