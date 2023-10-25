const express = require("express");

const {
  uploadImages,
  deleteImages,
} = require("../controllers/upload.controller.js");
const { isAdmin, authMiddleware } = require("../middlewares/auth.middleware.js");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages.js");

const { Router } = express;
const router = Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
