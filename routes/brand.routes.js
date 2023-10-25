const express = require("express");
const { Router } = express;
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");
const {
  getAllBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand.controller.js");

const router = Router();

router.get("/", getAllBrands);
router.get("/:id", getBrand);
router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);

module.exports = router;
