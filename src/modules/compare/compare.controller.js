const service = require('./compare.service');
const Product = require('../products/product.model');

exports.getCompare = async (req, res) => {
  try {
    const compare = await service.getCompare(req.user.id);

    // Динамическое объединение характеристик
    let allKeys = new Set();

    compare.products.forEach(product => {
      Object.keys(product.characteristics || {}).forEach(key => {
        allKeys.add(key);
      });
    });

    const characteristicsList = Array.from(allKeys);

    res.json({
      success: true,
      products: compare.products,
      characteristics: characteristicsList
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { productId } = req.body;

    const compare = await service.add(req.user.id, productId);
    res.json({ success: true, compare });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { productId } = req.body;

    const compare = await service.remove(req.user.id, productId);
    res.json({ success: true, compare });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.clear = async (req, res) => {
  try {
    const compare = await service.clear(req.user.id);
    res.json({ success: true, compare });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
