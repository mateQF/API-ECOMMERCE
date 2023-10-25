const Product = require("../models/Product.js");
const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { body } = req;
    const { title } = body;
    if (title) body.slug = slugify(title);
    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (error) {
    console.error("ERROR [CREATE_PRODUCT]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const product = await Product.findById(id);
    if (!product) res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("ERROR [GET_PRODUCT]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    //Filter
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    let query = Product.find(JSON.parse(queryString));

    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = Product.countDocuments();
      if (skip >= productCount) {
        res.status(400).json({
          message: "THIS PAGE DOES NOT EXIST",
        });
        console.error("ERROR [PAGINATION_ERROR]");
      }
    }

    const products = await query;
    res.status(200).json(products);
  } catch (error) {
    console.error("ERROR [GET_ALL_PRODUCTS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const { body } = req;
    const { title } = body;
    if (title) body.slug = slugify(title);
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) res.status(404).json({ message: "Product not found" }).end();
    res.status(200).json(product);
  } catch (error) {
    console.error("ERROR [UPDATE_PRODUCT]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const product = await Product.findByIdAndDelete(id);
    res.status(200).json(product);
  } catch (error) {
    console.error("ERROR [DELETE_PRODUCT]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const addToWishList = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const alreadyAdded = user.wishList.find(
      (id) => id.toString() === productId
    );
    const query = alreadyAdded
      ? { $pull: { wishList: productId } }
      : { $push: { wishList: productId } };
    const userUpdated = await User.findByIdAndUpdate(_id, query, {
      new: true,
    });
    res.status(200).json(userUpdated);
  } catch (error) {
    console.error("ERROR [ADD_PRODUCT_TO_WISHLIST]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const rating = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { star, comment, productId } = req.body;
    const product = await Product.findById(productId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getAllRatings = await Product.findById(productId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    const ratedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalrating: actualRating,
      },
      {
        new: true,
      }
    );
    return res.status(200).json(ratedProduct);
  } catch (error) {
    console.error("ERROR [RATING_PRODUCT]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
};
