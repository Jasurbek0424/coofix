const User = require('../users/user.model');
const bcrypt = require('bcrypt');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../../core/utils/jwt');

exports.register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed
  });

  const payload = { id: user._id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");

  const payload = { id: user._id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};
