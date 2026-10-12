const service = require('./review.service');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, text } = req.body;

    const review = await service.addReview(
      req.user.id,
      productId,
      rating,
      text
    );

    res.json({ success: true, review });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await service.getProductReviews(req.params.productId);
    res.json({ success: true, reviews });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeReview = async (req, res) => {
  try {
    const review = await service.removeReview(
      req.user.id,
      req.params.reviewId
    );

    res.json({ success: true, review });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
