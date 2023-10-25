const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
} = require("../controllers/product.controller");
const { Router } = express;
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");

const router = Router();

router.put("/wishlist", authMiddleware, addToWishList);
router.put("/rating", authMiddleware, rating);
router.post("/create-product", authMiddleware, isAdmin, createProduct);
router.get("/:id", getProduct);
router.get("/", getAllProducts);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
