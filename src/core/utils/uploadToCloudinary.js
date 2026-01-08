const cloudinary = require('../config/cloudinary');
const { v4: uuid } = require('uuid');

module.exports = function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce/products',
        public_id: uuid(),
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    ).end(file.buffer);
  });
};
