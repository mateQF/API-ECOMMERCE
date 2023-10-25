const Blog = require("../models/Blog.js");
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");
const { cloudinaryUploadImg } = require("../utils/cloudinary.js");
const fs = require("fs");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    console.error("ERROR [CREATE_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    if (!blog) {
      res
        .status(404)
        .json({
          message: "Blog not found",
        })
        .end();
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("ERROR [UPDATE_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      res
        .status(404)
        .json({
          message: "Blog not found",
        })
        .end();
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("ERROR [DELETE_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const blog = await Blog.findById(id).populate("likes");
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );

    if (!blog) {
      res
        .status(404)
        .json({
          message: "Blog not found",
        })
        .end();
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("ERROR [GET_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.status(200).json(blogs);
  } catch (error) {
    console.error("ERROR [GET_ALL_BLOGS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" }).end();
    const loginUserId = req?.user?._id;
    const isLiked = blog?.isLiked;
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          $set: { isDisliked: false, isLiked: true },
          $push: { likes: loginUserId },
        },
        { new: true }
      );
      return res.status(200).json(blog);
    }
    const query = isLiked
      ? {
          $pull: { likes: loginUserId },
          isLiked: false,
        }
      : {
          $push: { likes: loginUserId },
          isLiked: true,
        };
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, query, {
      new: true,
    });
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("ERROR [LIKE_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const disLikeBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" }).end();
    const loginUserId = req?.user?._id;
    const isDisliked = blog?.isDisliked;
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          $set: { isDisliked: true, isLiked: false },
          $push: { dislikes: loginUserId },
        },
        { new: true }
      );
      return res.status(200).json(blog);
    }
    const query = isDisliked
      ? {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        }
      : {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        };
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, query, {
      new: true,
    });
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("ERROR [DISLIKE_BLOG]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const { files } = req;
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((url) => url),
      },
      {
        new: true,
      }
    );
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("ERROR [UPLOAD_BLOG_IMAGE]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadImages,
};
