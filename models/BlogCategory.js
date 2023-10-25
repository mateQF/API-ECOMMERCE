const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const blogCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("BCategory", blogCategorySchema);
