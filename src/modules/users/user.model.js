const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },

  phone: {
    type: String,
    match: [
      /^(\+7|8)\d{10}$/,
      'Неверный формат номера телефона (Россия)'
    ]
  },

  email: {
    type: String,
    unique: true,
  },

  address: {
    city: {
      type: String,
    },
    street: {
      type: String,
    },
    house: {
      type: String,
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
