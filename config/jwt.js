const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken= (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = { generateToken, verifyToken };
