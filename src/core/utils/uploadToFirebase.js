const { bucket } = require('../config/firebase');
const { v4: uuid } = require('uuid');

async function uploadFileToFirebase(file) {
  const fileName = `${uuid()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => reject(err));

    stream.on('finish', async () => {
      await fileUpload.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
}

module.exports = uploadFileToFirebase;
