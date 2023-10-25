const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productCategorySchema = new Schema(
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

module.exports = model("PCategory", productCategorySchema);
