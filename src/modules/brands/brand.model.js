const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  image: { type: String, default: null } // логотип бренда
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
