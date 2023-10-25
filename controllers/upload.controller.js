const fs = require("fs");
const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const { files } = req
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => file);
    res.status(200).json(images);
  } catch (error) {
    console.error("ERROR [UPLOAD_CLOUDINARY_IMAGE]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    cloudinaryDeleteImg(id, "images");
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("ERROR [DELETE_CLOUDINARY_IMAGE]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
