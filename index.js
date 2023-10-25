require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes.js");
const productRoutes = require("./routes/product.routes.js");
const blogRoutes = require("./routes/blog.routes.js");
const productCategoryRoutes = require("./routes/productCategory.routes.js");
const blogCategoryRoutes = require("./routes/blogCategory.routes.js");
const brandRoutes = require("./routes/brand.routes.js");
const couponRoutes = require("./routes/coupon.routes.js");
const uploadRoutes = require("./routes/upload.routes.js");

const { notFound, errorHandler } = require("./middlewares/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 4000;

const connectDb = require("./config/connectDb.js");
connectDb();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/p-category", productCategoryRoutes);
app.use("/api/b-category", blogCategoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT -> [${PORT}]`);
});

module.exports = app;
