const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

const possiblePaths = [
  './serviceAccountKey.json',
  '../../../serviceAccountKey.json',
  '../../serviceAccountKey.json',
  '../serviceAccountKey.json',
  './config/serviceAccountKey.json',
];

for (const filePath of possiblePaths) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    serviceAccount = require(fullPath);
    console.log(`✅ Firebase service account загружен из: ${fullPath}`);
    break;
  } catch (err) {
    continue;
  }
}

if (!serviceAccount) {
  throw new Error('Firebase serviceAccountKey.json не найден ни по одному из путей!');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: serviceAccount.project_id + '.appspot.com',
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };