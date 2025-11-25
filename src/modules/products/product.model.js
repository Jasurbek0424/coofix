const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },

  description: { type: String, default: "" },

  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null }, // скидка, если есть

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },

  images: [{ type: String }], // массив Firebase ссылок

  characteristics: {
    type: Object,
    default: {} 
    // например:
    // { "power": "750W", "weight": "1.2kg", "color": "blue" }
  },

  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },

  isNew: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
