const Compare = require('./compare.model');
const Product = require('../products/product.model');

exports.getCompare = async (userId) => {
  let compare = await Compare.findOne({ user: userId }).populate('products');

  if (!compare) {
    compare = await Compare.create({ user: userId, products: [] });
  }

  return compare;
};

exports.add = async (userId, productId) => {
  let compare = await Compare.findOne({ user: userId });

  if (!compare) {
    compare = await Compare.create({ user: userId, products: [] });
  }

  // Ограничение: максимум 4 товара
  if (compare.products.length >= 4) {
    throw new Error("You can compare only 4 products at once");
  }

  // Если уже добавлен — не добавляем снова
  const exists = compare.products.includes(productId);
  if (exists) return compare;

  compare.products.push(productId);
  await compare.save();

  return compare;
};

exports.remove = async (userId, productId) => {
  const compare = await Compare.findOne({ user: userId });

  if (!compare) throw new Error("Compare list not found");

  compare.products = compare.products.filter(
    id => id.toString() !== productId
  );

  await compare.save();
  return compare;
};

exports.clear = async (userId) => {
  const compare = await Compare.findOneAndUpdate(
    { user: userId },
    { products: [] },
    { new: true }
  );

  return compare;
};
