const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "3d",
  });
};

module.exports = { generateRefreshToken };
