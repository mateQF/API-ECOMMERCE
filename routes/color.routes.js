const express = require("express");
const { Router } = express;
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");
const {
  getAllColors,
  getColor,
  createColor,
  updateColor,
  deleteColor,
} = require("../controllers/color.controller.js");

const router = Router();

router.get("/", getAllColors);
router.get("/:id", getColor);
router.post("/", authMiddleware, isAdmin, createColor);
router.put("/:id", authMiddleware, isAdmin, updateColor);
router.delete("/:id", authMiddleware, isAdmin, deleteColor);

module.exports = router;
