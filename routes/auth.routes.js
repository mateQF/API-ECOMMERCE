const express = require("express");
const {
  registerUser,
  loginUser,
  loginAdmin,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/user.controller.js");
const { Router } = express;
const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/auth.middleware.js");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/all-users", getAllUsers);
router.get("/refresh", handleRefreshToken);
router.post("/logout", logout);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);

router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.get("/get-orders", authMiddleware, getOrders);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.get("/cart", authMiddleware, getUserCart);
router.delete("/cart", authMiddleware, emptyCart);
router.post("/cart", authMiddleware, userCart);
router.put("/save-address", authMiddleware, saveAddress);
router.get("/wishlist", authMiddleware, getWishList);
router.put("/password", authMiddleware, updatePassword);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

module.exports = router;
