const { bucket } = require('../config/firebase');
const { v4: uuid } = require('uuid');

async function uploadFileToFirebase(file) {
  console.log("🔥 FILE:", file);
  console.log("🔥 BUFFER LENGTH:", file?.buffer?.length);

  const fileName = `${uuid()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const token = uuid();

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  stream.on("error", (err) => {
    console.log("🔥 FIREBASE STREAM ERROR:", err);
  });

  stream.on("finish", () => {
    console.log("🔥 UPLOAD FINISHED");
  });

  stream.end(file.buffer);
}

module.exports = uploadFileToFirebase;
