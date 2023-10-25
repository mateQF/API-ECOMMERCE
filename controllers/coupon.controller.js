const Coupon = require("../models/Coupon.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    console.error("ERROR [CREATE_COUPON]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json(coupons);
  } catch (error) {
    console.error("ERROR [GET_ALL_COUPONS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }
    res.status(200).json(coupon);
  } catch (error) {
    console.error("ERROR [GET_COUPON]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }
    res.status(200).json(coupon);
  } catch (error) {
    console.error("ERROR [UPDATE_COUPON]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      validateMongoDbId(id);
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({
          message: "Coupon not found",
        });
      }
      res.status(200).json(coupon);
    } catch (error) {
      console.error("ERROR [DELETE_COUPON]: " + error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });

module.exports = {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon
};
