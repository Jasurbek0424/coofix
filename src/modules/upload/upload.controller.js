const uploadToCloudinary = require('../../core/utils/uploadToCloudinary');

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file' });
    }

    const image = await uploadToCloudinary(req.file);

    res.json({
      success: true,
      image,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files' });
    }

    const images = [];

    for (const file of req.files) {
      images.push(await uploadToCloudinary(file));
    }

    res.json({
      success: true,
      images,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

