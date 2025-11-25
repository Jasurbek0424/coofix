const Category = require('./category.model');
const makeSlug = require('../../core/utils/slugify');

exports.create = async (req, res) => {
  try {
    const { name, parent, image } = req.body;

    const slug = makeSlug(name);

    const category = await Category.create({
      name,
      slug,
      parent: parent || null,
      image: image || null
    });

    res.json({ success: true, category });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, categories });
};

exports.getOne = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  res.json({ success: true, category });
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, category });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
