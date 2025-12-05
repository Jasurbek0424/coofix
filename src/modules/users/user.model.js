const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  provider: { type: String, default: 'local' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  refreshToken: { type: String, default: null },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
