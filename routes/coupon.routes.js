const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller.js");
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");
const { Router } = express;

const router = Router();

router.get("/", authMiddleware, isAdmin, getAllCoupons);
router.get("/:id", authMiddleware, isAdmin, getCoupon);
router.post("/", authMiddleware, isAdmin, createCoupon);
router.put("/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);

module.exports = router;
