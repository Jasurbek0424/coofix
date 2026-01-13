const Brand = require('./brand.model');
const makeSlug = require('../../core/utils/slugify');
const cloudinary = require('cloudinary').v2;

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
    const updateData = { ...req.body };

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Бренд не найден'
      });
    }

    // если меняется имя → обновляем slug
    if (updateData.name) {
      const newSlug = makeSlug(updateData.name);

      const exists = await Brand.findOne({
        slug: newSlug,
        _id: { $ne: brand._id }
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Бренд с таким именем уже существует'
        });
      }

      updateData.slug = newSlug;
    }

    // если меняется картинка → удаляем старую из Cloudinary
    if (
      updateData.image &&
      brand.image?.publicId &&
      updateData.image.publicId !== brand.image.publicId
    ) {
      await cloudinary.uploader.destroy(brand.image.publicId);
    }

    const updated = await Brand.findByIdAndUpdate(
      brand._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, brand: updated });

  } catch (err) {
    console.error('BRAND UPDATE ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления бренда'
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Бренд не найден' });
    }

    if (brand.image && brand.image.publicId) {
      await cloudinary.uploader.destroy(brand.image.publicId);
    }

    await brand.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
