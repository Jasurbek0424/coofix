const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image: {
    url: String,
    publicId: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
