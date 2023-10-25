const mongoose = require("mongoose");
const { MONGO_DB_URI } = process.env;

const connectDb = () => {
  try {
    mongoose
      .connect(MONGO_DB_URI)
      .then(() => {
        console.log("DATABASE CONNECTED SUCCESSFULLY [MONGODB]");
      })
      .catch(() => {
        console.error("CONNECTION FAILED");
      });
  } catch (error) {
    console.error(error);
    throw new Error(error)
  }
};

module.exports = connectDb;
