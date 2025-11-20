const admin = require('firebase-admin');

let initialized = false;

const initializeFirebaseAdmin = () => {
  if (initialized) {
    return;
  }

  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const serviceAccountKey = process.env.SERVICE_ACCOUNT;
  
  if (!serviceAccountKey) {
    throw new Error(
      'SERVICE_ACCOUNT environment variable is not configured. ' +
      'Please set SERVICE_ACCOUNT to the raw contents of your serviceAccount.json file.'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (err) {
    throw new Error(
      'SERVICE_ACCOUNT must be a valid JSON string. ' +
      `Parse error: ${err.message}`
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log('✅ Firebase Admin SDK initialized');
};

const getFirebaseAdmin = () => {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin;
};

const getFirestore = () => {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

const getAuth = () => {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};

const getStorage = () => {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin.storage();
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseAdmin,
  getFirestore,
  getAuth,
  getStorage
};
