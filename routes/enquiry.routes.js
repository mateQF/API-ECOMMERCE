const express = require("express");
const { Router } = express;
const {
  isAdmin,
  authMiddleware,
} = require("../middlewares/auth.middleware.js");
const {
  getAllEnquirys,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
} = require("../controllers/enquiry.controller.js");

const router = Router();

router.get("/", getAllEnquirys);
router.get("/:id", getEnquiry);
router.post("/", createEnquiry);
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);

module.exports = router;
