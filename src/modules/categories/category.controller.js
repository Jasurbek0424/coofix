const Category = require('./category.model');
const Product = require('../products/product.model');
const makeSlug = require('../../core/utils/slugify');

exports.create = async (req, res) => {
  try {
    const { name, parent, image } = req.body;

    if (parent === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Категория не может быть родителем самой себя'
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Название обязательно' });
    }

    const slug = makeSlug(name);

    // проверка уникальности slug
    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Категория с таким именем уже существует'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      parent: parent || null,
      image: image || null
    });

    res.status(201).json({ success: true, category });

  } catch (err) {
    console.error('CATEGORY CREATE ERROR:', err);
    res.status(500).json({ success: false, message: 'Ошибка создания категории' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'parent',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $unwind: {
          path: '$parent',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          'parent.name': 1,
          'parent._id': 1,
          name: 1,
          slug: 1,
          image: 1,
          productCount: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({ success: true, categories });

  } catch (err) {
    console.error('CATEGORY GET ALL ERROR:', err);
    res.status(500).json({ success: false, message: 'Ошибка загрузки категорий' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug })
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }

    const productCount = await Product.countDocuments({
      category: category._id
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        productCount
      }
    });

  } catch (err) {
    console.error('CATEGORY GET ONE ERROR:', err);
    res.status(500).json({ success: false, message: 'Ошибка получения категории' });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if ('parent' in updateData && !updateData.parent) {
      updateData.parent = null;
    }

    if (
      updateData.parent &&
      String(updateData.parent) === String(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Категория не может быть родителем самой себя'
      });
    }

    if (updateData.name) {
      const newSlug = makeSlug(updateData.name);

      const exists = await Category.findOne({
        slug: newSlug,
        _id: { $ne: req.params.id }
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Категория с таким именем уже существует'
        });
      }

      updateData.slug = newSlug;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({ success: true, category });

  } catch (err) {
    console.error('CATEGORY UPDATE ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления категории'
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const childCount = await Category.countDocuments({
      parent: categoryId
    });

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить категорию, у неё есть подкатегории'
      });
    }

    const productsCount = await Product.countDocuments({
      category: categoryId
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить категорию, в ней есть товары'
      });
    }

    const deleted = await Category.findByIdAndDelete(categoryId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }

    res.json({ success: true });

  } catch (err) {
    console.error('CATEGORY REMOVE ERROR:', err);
    res.status(500).json({ success: false, message: 'Ошибка удаления категории' });
  }
};

exports.getTree = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const map = new Map();
    const roots = [];

    categories.forEach(cat => {
      map.set(String(cat._id), {
        ...cat,
        children: []
      });
    });

    categories.forEach(cat => {
      if (cat.parent) {
        const parent = map.get(String(cat.parent));
        if (parent) {
          parent.children.push(map.get(String(cat._id)));
        }
      } else {
        roots.push(map.get(String(cat._id)));
      }
    });

    res.json({
      success: true,
      tree: roots
    });

  } catch (err) {
    console.error('CATEGORY TREE ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки дерева категорий'
    });
  }
};
