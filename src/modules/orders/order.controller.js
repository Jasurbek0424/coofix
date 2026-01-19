const service = require('./order.service');

exports.createOrder = async (req, res) => {
  try {
    const { address, phone } = req.body;

    const order = await service.createOrder(
      req.user.id,
      address,
      phone
    );

    res.json({ success: true, order });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { orders, pagination } = await service.getUserOrders(req.user.id, page, limit);
    res.json({ success: true, orders, ...pagination });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { orders, pagination } = await service.getAllOrders(page, limit);
    res.json({ success: true, orders, ...pagination });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await service.updateStatus(req.params.orderId, status);
    res.json({ success: true, order });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
