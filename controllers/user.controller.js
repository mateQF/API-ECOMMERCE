const User = require("../models/User.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");
const Coupon = require("../models/Coupon.js");
const Order = require("../models/Order.js");
const asyncHandler = require("express-async-handler");
const { generateToken, verifyToken } = require("../config/jwt.js");
const { validateMongoDbId } = require("../utils/validateMognoDbId.js");
const { generateRefreshToken } = require("../config/refreshToken.js");
const { sendEmail } = require("./email.controller.js");
const crypto = require("crypto");
const calculateTotalCart = require("../utils/calculateTotalCart.js");
const uniqid = require("uniqid");

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const userFound = await User.findOne({ email });
    if (!userFound) {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } else {
      res.status(400).json({
        message: "User already exists",
      });
    }
  } catch (error) {
    console.error("ERROR [REGISTER_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email });
    if (!userFound)
      return res.status(404).json({ message: "Invalid credentials" }).end();
    if (await userFound.isPasswordMatched(password)) {
      const refreshToken = await generateRefreshToken(userFound?._id);
      await User.findByIdAndUpdate(
        userFound._id,
        {
          refreshToken,
        },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.status(200).json({
        _id: userFound?._id,
        firstName: userFound?.firstName,
        lastName: userFound?.lastName,
        email: userFound?.email,
        mobile: userFound?.mobile,
        token: generateToken(userFound?._id),
      });
    } else {
      res.status(400).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("ERROR [LOGIN_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminFound = await User.findOne({ email });
    if (!adminFound)
      return res.status(404).json({ message: "Invalid credentials" }).end();
    if (adminFound.role !== "admin")
      return res.status(401).json({ message: "Unauthorized" }).end();
    if (await adminFound.isPasswordMatched(password)) {
      const refreshToken = await generateRefreshToken(adminFound?._id);
      await User.findByIdAndUpdate(
        adminFound._id,
        {
          refreshToken,
        },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.status(200).json({
        _id: adminFound?._id,
        firstName: adminFound?.firstName,
        lastName: adminFound?.lastName,
        email: adminFound?.email,
        mobile: adminFound?.mobile,
        token: generateToken(adminFound?._id),
      });
    } else {
      res.status(400).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("ERROR [LOGIN_ADMIN]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const { cookies } = req;
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({
        message: "Refresh token is required",
      });
    }
    const userFound = await User.findOne({ refreshToken });
    if (!userFound) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return res.status(204).end();
    }
    await User.findOneAndUpdate(
      { refreshToken },
      {
        refreshToken: "",
      }
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(204).end();
  } catch (error) {
    console.error("ERROR [LOGOUT_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  try {
    const { cookies } = req;
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({
        message: "Refresh token is required",
      });
    }
    const userFound = await User.findOne({ refreshToken });
    if (!userFound) {
      res.status(400).json({
        message: "Invalid or missing refresh token",
      });
    }
    verifyToken(refreshToken)
      .then((decoded) => {
        if (userFound.id !== decoded.id) {
          res.status(400);
          throw new Error("ERROR WHILE VALIDATING TOKEN");
        }
        const accessToken = generateToken(userFound?._id);
        res.status(200).json({ accessToken });
      })
      .catch((error) => {
        res.status(400);
        throw new Error("ERROR WHILE VALIDATING TOKEN: " + error);
      });
  } catch (error) {
    console.error("ERROR [REFRESH_TOKEN]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users).end();
  } catch (error) {
    console.error("ERROR [GET_ALL_USERS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const userFound = await User.findById(id);
    if (!userFound) res.status(404).json({ message: "User not found" }).end();
    res.status(200).json(userFound).end();
  } catch (error) {
    console.error("ERROR [GET_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { firstName, lastName, mobile, email } = req.body;
    const newUserInfo = {
      firstName: firstName,
      lastName: lastName,
      mobile: mobile,
      email: email,
    };
    const userToUpdate = await User.findByIdAndUpdate(_id, newUserInfo, {
      new: true,
    });
    if (!userToUpdate)
      res.status(404).json({ message: "User not found" }).end();
    res.status(200).json(userToUpdate);
  } catch (error) {
    console.error("ERROR [UPDATE_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const userToDelete = await User.findByIdAndDelete(id);
    if (!userToDelete)
      res.status(404).json({ message: "User not found" }).end();
    res.status(200).json(userToDelete).end();
  } catch (error) {
    console.error("ERROR [DELETE_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const blockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const userToBlock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    if (!userToBlock) res.status(404).json({ message: "User not found" });
    res.status(200).json({
      userToBlock,
      message: "User blocked",
    });
  } catch (error) {
    console.error("ERROR [BLOCK_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const userToUnBlock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    if (!userToUnBlock) res.status(404).json({ message: "User not found" });
    res.status(200).json({
      userToUnBlock,
      message: "User unblocked",
    });
  } catch (error) {
    console.error("ERROR [UNBLOCK_USER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    if (!password) {
      res.status(400).json({ message: "Password must be provided" });
    }
    const user = await User.findById(_id);
    user.password = password;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("ERROR [UPDATE_PASSWORD]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const token = await user.createPasswordResetToken();
    console.log(token);
    await user.save();
    const resetURL =
      "Please follow this link to reset your password. Link will be valid for 10 minutes. <a href=`http://localhost:5505/api/user/reset-password/${token}`>Click here</a>";
    const data = {
      to: email,
      text: "If you do not request a password change, please do not answer this email",
      subject: "Forgot password link",
      htm: resetURL,
    };
    sendEmail(data);
    res.status(200).json(token);
  } catch (error) {
    console.error("ERROR [FORGOT_PASSWORD]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Token expired, please try again later.",
      });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("ERROR [RESET_PASSWORD]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getWishList = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const user = await User.findById(_id).populate("wishList");
    if (!user) {
      return res
        .status(404)
        .json({
          message: "User not found",
        })
        .end();
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("ERROR [GET_WISHLIST]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const saveAddress = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const user = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("ERROR [SAVE_ADDRESS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const userCart = asyncHandler(async (req, res) => {
  try {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      await Cart.findOneAndDelete({ orderby: user._id });
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let { price } = await Product.findById(cart[i]._id)
        .select("price")
        .exec();
      object.price = price;
      products.push(object);
    }
    const cartTotal = calculateTotalCart(products);
    const newCart = await Cart.create({
      products,
      cartTotal,
      orderby: user._id,
    });
    return res.status(200).json(newCart);
  } catch (error) {
    console.error("ERROR [USER_CART]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" }).end();
    }
    return res.status(200).json(cart);
  } catch (error) {
    console.error("ERROR [GET_USER_CART]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }
    return res.status(200).json(cart);
  } catch (error) {
    console.error("ERROR [EMPTY_CART]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      return res
        .status(404)
        .json({
          message: "Invalid coupon",
        })
        .end();
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
      orderby: user._id,
    }).populate("products.product");
    const totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      {
        orderby: user._id,
      },
      {
        totalAfterDiscount,
      },
      {
        new: true,
      }
    );
    return res.status(200).json(totalAfterDiscount);
  } catch (error) {
    console.error("ERROR [APPLY_COUPON]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    if (!COD) {
      return res
        .status(400)
        .json({
          message: "Create cash order failed",
        })
        .end();
    }
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({
          message: "User not found",
        })
        .end();
    }
    const userCart = await Cart.findOne({ orderby: user._id });
    if (!userCart) {
      return res
        .status(404)
        .json({
          message: "Something went wrong",
        })
        .end();
    }
    let finalAmout = 0;
    couponApplied
      ? (finalAmout = userCart.totalAfterDiscount)
      : (finalAmout = userCart.cartTotal);

    let newOrder = await Order.create({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    });
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    await Product.bulkWrite(update, {});
    res.status(200).json({
      message: "Success",
      newOrder,
    });
  } catch (error) {
    console.error("ERROR [CREATE_ORDER]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const userOrders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.status(200).json(userOrders);
  } catch (error) {
    console.error("ERROR [GET_USER_ORDERS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({
          message: "User not found",
        })
        .end();
    }
    const userOrders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.status(200).json(userOrders);
  } catch (error) {
    console.error("ERROR [GET_ORDER_BY_USER_ID]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status,
        },
      },
      { new: true }
    );
    if (!updateOrderStatus) {
      return res
        .status(404)
        .json({
          message: "Order not found",
        })
        .end();
    }
    return res.status(200).json({ updateOrderStatus });
  } catch (error) {
    console.error("ERROR [UPDATE_ORDER_STATUS]: " + error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  getOrderByUserId,
  updateOrderStatus,
};
