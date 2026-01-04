const Product = require('../products/product.model');
const Order = require('../orders/order.model');
const User = require('../users/user.model');

exports.overview = async (req, res) => {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalProducts,
    totalOrders,
    totalUsers,

    newUsersThisMonth,
    newUsersLastMonth,

    revenueThisMonthAgg,
    revenueLastMonthAgg,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),

    User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),

    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
  const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;

  const calcChange = (current, previous) => {
    if (previous === 0) {
      return {
        percent: current > 0 ? 100 : 0,
        type: current > 0 ? 'positive' : 'neutral',
      };
    }

    const percent = Math.round(((current - previous) / previous) * 100);

    return {
      percent,
      type: percent > 0 ? 'positive' : percent < 0 ? 'negative' : 'neutral',
    };
  };

  const usersChange = calcChange(newUsersThisMonth, newUsersLastMonth);
  const revenueChange = calcChange(revenueThisMonth, revenueLastMonth);

  res.json({
    totalProducts,
    totalOrders,

    newUsers: {
      value: newUsersThisMonth,
      ...usersChange,
    },

    revenue: {
      value: revenueThisMonth,
      ...revenueChange,
    },
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
