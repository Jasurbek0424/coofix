const uploadToCloudinary = require('../../core/utils/uploadToCloudinary');

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const url = await uploadToCloudinary(req.file);

    res.json({
      success: true,
      url
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files" });

    const urls = [];

    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      urls.push(url);
    }

    res.json({
      success: true,
      urls
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
