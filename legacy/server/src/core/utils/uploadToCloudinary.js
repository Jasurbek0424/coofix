const cloudinary = require('../config/cloudinary');
const { v4: uuid } = require('uuid');

module.exports = function uploadToCloudinary(file, folder = 'ecommerce/products', resourceType = 'image') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uuid(),
        resource_type: resourceType,
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
