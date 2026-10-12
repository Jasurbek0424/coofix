const Order = require("./order.model");
const Cart = require("../cart/cart.model");

const mongoose = require('mongoose');

const ALLOWED_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

exports.createOrder = async (userId, address, phone) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    if (!address?.trim()) {
      throw new Error("Address is required");
    }

    if (!phone?.match(/^\+?[0-9]{9,15}$/)) {
      throw new Error("Invalid phone number");
    }

    // Проверка стока и обновление
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create([{
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        title: item.product.title, // Note: title might need to be fetched if not in cart item, but assuming it is populated or ok
        price: item.price,
        quantity: item.quantity,
      })),
      total: cart.total,
      address,
      phone,
      status: "pending",
    }], { session });

    cart.items = [];
    cart.total = 0;
    await cart.save({ session });

    await session.commitTransaction();
    return order[0];

  } catch (err) {
    await session.abortTransaction();
    throw err;

  } finally {
    session.endSession();
  }
};

exports.getUserOrders = async (userId, page = 1, limit = 10) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: userId })
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getAllOrders = async (page = 1, limit = 10) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .populate("user")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments()
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  };
};


exports.updateStatus = async (orderId, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid order status");
  }

  return Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};