const express = require("express");
const { Router } = express;
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
} = require("../controllers/blogCategory.controller.js");

const router = Router();

router.get("/", getAllCategories)
router.get("/:id", getCategory)
router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
