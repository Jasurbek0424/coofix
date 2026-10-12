const Product = require('./product.model');
const makeSlug = require('../../core/utils/slugify');
const cloudinary = require('cloudinary').v2;

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
      isSale,
      isHit
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
      stock: quantity || 0,
      isNew: isNew || false,
      isSale: isSale || false,
      isHit: isHit || false
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    for (const img of product.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await product.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        stock: quantity
      },
      { new: true }
    );

    res.json({ success: true, product });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
