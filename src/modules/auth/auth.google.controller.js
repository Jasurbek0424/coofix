const { admin } = require('../../core/config/firebase');
const User = require('../users/user.model');
const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../../core/config/env');

exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    const googleUser = await admin.auth().verifyIdToken(idToken);

    const { email, name } = googleUser;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        provider: 'google',
        password: null,
        role: 'customer'
      });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_ACCESS_SECRET,
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
