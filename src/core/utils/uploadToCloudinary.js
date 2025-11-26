const cloudinary = require('../config/cloudinary');
const { v4: uuid } = require('uuid');

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/products",
        public_id: uuid(),
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(file.buffer);
  });
}

module.exports = uploadToCloudinary;
