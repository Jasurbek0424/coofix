const User = require("./user.model");
const Favorite = require("../favorites/favorite.model");
const Compare = require("../compare/compare.model");
const Cart = require("../cart/cart.model");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const fav = await Favorite.findOne({ user: userId }).populate({
      path: "products",
      select: "title price images",
    });

    const compare = await Compare.findOne({ user: userId }).populate({
      path: "products",
      select: "title price images",
    });

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title price images",
    });

    const cartCount = cart ? cart.items.length : 0;

    const isProfileComplete =
      user.lastName &&
      user.phone &&
      user.address?.city &&
      user.address?.street &&
      user.address?.house;

    res.json({
      success: true,
      user,

      favorites: fav ? fav.products : [],
      compare: compare ? compare.products : [],
      cart: cart ? cart.items : [],

      counts: {
        favorites: fav ? fav.products.length : 0,
        compare: compare ? compare.products.length : 0,
        cart: cart ? cart.items.length : 0,
      },

      cartTotal: cart ? cart.total : 0,
      profileComplete: Boolean(isProfileComplete),
      isVerified: user.isVerified || false
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};