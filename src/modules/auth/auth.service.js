const User = require('../users/user.model');
const bcrypt = require('bcrypt');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../../core/utils/jwt');
const VerifyToken = require('../verify/verifyToken.model');
const crypto = require("crypto");
const sendEmail = require('../../core/utils/sendEmail');


exports.register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    isVerified: false
  });

  const token = crypto.randomBytes(32).toString("hex");

  await VerifyToken.create({
    userId: user._id,
    token,
    expiresAt: Date.now() + 1000 * 60 * 60
  });

  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}&user=${user._id}`;

  await sendEmail(email, "Verify Email", `
    <h2>Подтверждение почты</h2>
    <p>Нажмите на ссылку:</p>
    <a href="${url}">${url}</a>
  `);

  return {
    message: "Check your email to verify your account"
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Email not verified");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");

  const payload = { id: user._id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};
