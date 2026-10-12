const cartService = require('./cart.service');

exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.id, productId, quantity || 1);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.changeQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.changeQuantity(req.user.id, productId, quantity);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await cartService.removeFromCart(req.user.id, productId);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
