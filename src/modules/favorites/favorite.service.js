const Favorite = require('./favorite.model');

exports.getFavorites = async (userId) => {
  let fav = await Favorite.findOne({ user: userId }).populate('products');

  if (!fav) {
    fav = await Favorite.create({ user: userId, products: [] });
  }

  return fav;
};

exports.toggleFavorite = async (userId, productId) => {
  let fav = await Favorite.findOne({ user: userId });

  if (!fav) {
    fav = await Favorite.create({ user: userId, products: [productId] });
    return fav;
  }

  // Уже в избранном?
  const exists = fav.products.includes(productId);

  if (exists) {
    fav.products = fav.products.filter(id => id.toString() !== productId);
  } else {
    fav.products.push(productId);
  }

  await fav.save();
  return fav;
};

exports.remove = async (userId, productId) => {
  const fav = await Favorite.findOne({ user: userId });
  if (!fav) throw new Error("Favorite not found");

  fav.products = fav.products.filter(
    id => id.toString() !== productId
  );

  await fav.save();
  return fav;
};
