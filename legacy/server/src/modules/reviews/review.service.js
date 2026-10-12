const Review = require('./review.model');
const Product = require('../products/product.model');

exports.addReview = async (userId, productId, rating, text) => {
  let review = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    { rating, text },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAvg: stats[0].avgRating.toFixed(1),
      ratingCount: stats[0].count
    });
  }

  return review;
};

exports.getProductReviews = async (productId) => {
  return Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });
};

exports.removeReview = async (userId, reviewId) => {
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    user: userId
  });

  if (!review) throw new Error("Review not found");

  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(review.product, {
      ratingAvg: stats[0].avgRating.toFixed(1),
      ratingCount: stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(review.product, {
      ratingAvg: 0,
      ratingCount: 0
    });
  }

  return review;
};
