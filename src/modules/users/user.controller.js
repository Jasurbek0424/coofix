const User = require('./user.model');
const Favorite = require('../favorites/favorite.model');
const Compare = require('../compare/compare.model');
const Cart = require('../cart/cart.model');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Загружаем пользователя
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Загружаем связанные данные
    const fav = await Favorite.findOne({ user: userId });
    const compare = await Compare.findOne({ user: userId });
    const cart = await Cart.findOne({ user: userId });

    // Количество позиций (не общих товаров)
    const cartCount = cart ? cart.items.length : 0;

    res.json({
      success: true,
      user,
      counts: {
        favorites: fav ? fav.products.length : 0,
        compare: compare ? compare.products.length : 0,
        cart: cartCount
      },
      cartTotal: cart ? cart.total : 0
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
