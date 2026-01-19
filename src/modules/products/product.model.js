const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },

    description: { type: String, default: "" },

    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null }, // скидка, если есть

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    images: [
      {
        url: String,
        publicId: String,
      }
    ],

    characteristics: {
      type: Object,
      default: {},
      // например:
      // { "power": "750W", "weight": "1.2kg", "color": "blue" }
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true
    },

    isNew: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    isHit: { type: Boolean, default: false },

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
