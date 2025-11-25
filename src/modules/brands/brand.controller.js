const Brand = require('./brand.model');
const makeSlug = require('../../core/utils/slugify');

exports.create = async (req, res) => {
  try {
    const { name, image } = req.body;

    const slug = makeSlug(name);

    const brand = await Brand.create({
      name,
      slug,
      image: image || null
    });

    res.json({ success: true, brand });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.json({ success: true, brands });
};

exports.getOne = async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  res.json({ success: true, brand });
};

exports.update = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, brand });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
