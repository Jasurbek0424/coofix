const admin = require('../../core/config/firebase');
const User = require('../users/user.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../core/config/env');

exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Проверяем токен на Firebase
    const googleUser = await admin.auth().verifyIdToken(idToken);

    const { email, name } = googleUser;

    let user = await User.findOne({ email });

    if (!user) {
      // Создаём пользователя, если первый вход
      user = await User.create({
        name,
        email,
        provider: 'google',
        password: null, // нет пароля
        role: 'customer'
      });
    }

    // Генерируем свой JWT для сайта
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
