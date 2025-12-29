const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },

  phone: {
    type: String,
    required: true,
    match: [
      /^(\+7|8)\d{10}$/,
      'Неверный формат номера телефона (Россия)'
    ]
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  address: {
    city: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    house: {
      type: String,
      required: true
    },
    building: {
      type: String
    },
    apartment: {
      type: String
    }
  },

  password: String,

  provider: {
    type: String,
    default: 'local'
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  refreshToken: {
    type: String,
    default: null
  },

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
