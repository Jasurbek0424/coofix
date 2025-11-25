const Cart = require('./cart.model');
const Product = require('../products/product.model');

exports.getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

exports.addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      total: 0
    });
  }

  const existing = cart.items.find(
    item => item.product.toString() === productId
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  // Пересчёт суммы
  cart.total = cart.items.reduce((sum, item) => (
    sum + item.quantity * item.price
  ), 0);

  await cart.save();
  return cart;
};

exports.changeQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(i => i.product.toString() === productId);
  if (!item) throw new Error("Item not found");

  item.quantity = quantity;

  // если 0 — удаляем
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
  }

  cart.total = cart.items.reduce((sum, item) =>
    sum + item.quantity * item.price
  , 0);

  await cart.save();
  return cart;
};

exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  cart.total = cart.items.reduce((sum, item) =>
    sum + item.quantity * item.price
  , 0);

  await cart.save();
  return cart;
};

exports.clearCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], total: 0 },
    { new: true }
  );

  return cart;
};
