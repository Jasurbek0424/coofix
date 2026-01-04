const Product = require('../products/product.model');
const Order = require('../orders/order.model');
const User = require('../users/user.model');

exports.overview = async (req, res) => {
  const [products, orders, users] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.json({
    totalProducts: products,
    totalOrders: orders,
    newUsers: users,
    revenue: revenueAgg[0]?.total || 0,
  });
};

exports.sales = async (req, res) => {
  const data = await Order.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        sales: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  res.json(
    data.map(item => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      sales: item.sales,
      orders: item.orders
    }))
  );
};

exports.byCategory = async (req, res) => {
  const data = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        total: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
  ]);

  const sum = data.reduce((a, b) => a + b.total, 0);

  res.json(
    data.map(item => ({
      name: item.category.name,
      value: Math.round((item.total / sum) * 100),
    }))
  );
};

exports.recentOrders = async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name');

  res.json(
    orders.map(o => ({
      id: `#${o._id.toString().slice(-5)}`,
      customer: o.user?.name || 'Guest',
      total: o.totalPrice,
      status: o.status,
    }))
  );
};
