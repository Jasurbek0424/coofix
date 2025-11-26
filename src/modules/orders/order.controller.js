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
    const orders = await service.getUserOrders(req.user.id);
    res.json({ success: true, orders });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await service.getAllOrders();
    res.json({ success: true, orders });

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
