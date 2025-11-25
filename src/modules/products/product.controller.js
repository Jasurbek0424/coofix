const Brand = require('../brands/brand.model');
const Category = require('../categories/category.model');
const Product = require('./product.model');

exports.getAll = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('category brand')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.json({ success: true, products, total });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category brand');

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNew = async (req, res) => {
  try {
    const products = await Product.find({ isNew: true })
      .populate('category brand')
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSale = async (req, res) => {
  try {
    const products = await Product.find({ isSale: true })
      .populate('category brand');

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q;

    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    });

    res.json({ success: true, products });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.filter = async (req, res) => {
  try {
    let query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const products = await Product.find(query)
      .populate('category brand');

    res.json({ success: true, products });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.related = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(10);

    res.json({ success: true, related });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.slug;

    const category = await Category.findOne({ slug: categorySlug });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const products = await Product.find({ category: category._id });

    res.json({ success: true, products });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByBrand = async (req, res) => {
  try {
    const brandSlug = req.params.slug;

    const brand = await Brand.findOne({ slug: brandSlug });
    if (!brand)
      return res.status(404).json({ message: "Brand not found" });

    const products = await Product.find({ brand: brand._id });

    res.json({ success: true, products });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
