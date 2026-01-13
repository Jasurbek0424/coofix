const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  image: {
    url: String,
    publicId: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
