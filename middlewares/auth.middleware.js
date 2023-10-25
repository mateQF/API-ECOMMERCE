const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { JWT_SECRET } = process.env;

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      console.error("ERROR: [AUTH_TOKEN_ERROR]/[TOKEN_EXPIRED]: " + error);
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }
  } else {
    res.status(500).json({ message: "Internal Server Error" });
    throw new Error("No token provided -> access denied");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== "admin") {
      res.status(400).json({ message: "Only admin has access" });
      throw new Error("NOT_ADMIN -> ACCESS_DENIED");
    }
    next();
  } catch (error) {
    console.error("ERROR: [IS_ADMIN_ERROR]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = { authMiddleware, isAdmin };
