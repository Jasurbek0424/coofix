const service = require('./auth.service');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const { JWT_REFRESH_SECRET } = require('../../core/config/env');
const { generateAccessToken, generateRefreshToken } = require('../../core/utils/jwt');
const VerifyToken = require('../verify/verifyToken.model');

exports.register = async (req, res) => {
  try {
    const user = await service.register(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await service.login(req.body);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const payload = { id: user._id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token, user } = req.query;

  const record = await VerifyToken.findOne({ userId: user, token });
  if (!record) return res.status(400).json({ message: "Invalid or expired token" });

  if (record.expiresAt < Date.now()) {
    await VerifyToken.deleteOne({ _id: record._id });
    return res.status(400).json({ message: "Token expired" });
  }

  await User.findByIdAndUpdate(user, { isVerified: true });
  await VerifyToken.deleteOne({ _id: record._id });

  return res.json({ success: true, message: "Email verified" });
};