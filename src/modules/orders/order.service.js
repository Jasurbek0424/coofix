const Order = require('./order.model');
const Cart = require('../cart/cart.model');

exports.createOrder = async (userId, address, phone) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = await Order.create({
    user: userId,
    items: cart.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price
    })),
    total: cart.total,
    address,
    phone,
    status: "pending"
  });

  // Очистка корзины после заказа
  cart.items = [];
  cart.total = 0;
  await cart.save();

  return order;
};


exports.getUserOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate("items.product")
    .sort({ createdAt: -1 });
};

exports.getAllOrders = async () => {
  return Order.find()
    .populate("user")
    .populate("items.product")
    .sort({ createdAt: -1 });
};

exports.updateStatus = async (orderId, status) => {
  return Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};
