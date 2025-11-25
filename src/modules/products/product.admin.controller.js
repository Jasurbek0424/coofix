const Product = require('./product.model');
const makeSlug = require('../../core/utils/slugify');

exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      category,
      brand,
      images,
      characteristics,
      quantity,
      isNew,
      isSale
    } = req.body;

    const slug = makeSlug(name);

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      oldPrice: oldPrice || null,
      category,
      brand,
      images: images || [],
      characteristics: characteristics || {},
      quantity: quantity || 0,
      inStock: quantity > 0,
      isNew: isNew || false,
      isSale: isSale || false
    });

    res.json({ success: true, product });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.json({ success: true, product });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        quantity,
        inStock: quantity > 0
      },
      { new: true }
    );

    res.json({ success: true, product });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
