const mongoose = require('mongoose');
const { MONGO_URL } = require('../config/env');

exports.connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo error:", err);
  }
};
