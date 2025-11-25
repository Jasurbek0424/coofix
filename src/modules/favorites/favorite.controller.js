const service = require('./favorite.service');

exports.getFavorites = async (req, res) => {
  try {
    const fav = await service.getFavorites(req.user.id);
    res.json({ success: true, favorites: fav.products });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const { productId } = req.body;
    const fav = await service.toggleFavorite(req.user.id, productId);
    res.json({ success: true, favorites: fav.products });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { productId } = req.body;
    const fav = await service.remove(req.user.id, productId);
    res.json({ success: true, favorites: fav.products });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
