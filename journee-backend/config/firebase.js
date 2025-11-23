const dotenv = require('dotenv');
dotenv.config();

const admin = require('firebase-admin');
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Admin SDK configuration (for server operations)
const serviceAccount = process.env.NODE_ENV === 'production'
  ? {
    type: process.env.FIRESTORE_ADMIN_TYPE,
    project_id: process.env.FIRESTORE_ADMIN_PROJECT_ID,
    private_key_id: process.env.FIRESTORE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIRESTORE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIRESTORE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIRESTORE_ADMIN_CLIENT_ID,
    auth_uri: process.env.FIRESTORE_ADMIN_AUTH_URI,
    token_uri: process.env.FIRESTORE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIRESTORE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIRESTORE_ADMIN_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIRESTORE_ADMIN_UNIVERSE_DOMAIN
  }
  : require('../serviceAccountKey.json'); // Development

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const adminDb = admin.firestore();

// Client SDK configuration (if needed)
const firebaseConfig = {
  apiKey: process.env.FIRESTORE_CLIENT_API_KEY,
  authDomain: process.env.FIRESTORE_CLIENT_AUTH_DOMAIN,
  projectId: process.env.FIRESTORE_CLIENT_PROJECT_ID,
  storageBucket: process.env.FIRESTORE_CLIENT_STORAGE_BUCKET,
  messagingSenderId: process.env.FIRESTORE_CLIENT_MESSAGING_SENDER_ID,
  appId: process.env.FIRESTORE_CLIENT_APP_ID,
  measurementId: process.env.FIRESTORE_CLIENT_MEASUREMENT_ID
};

const clientApp = initializeApp(firebaseConfig);
const clientDb = getFirestore(clientApp);

module.exports = {
  adminDb,    // Use for server operations (CRUD, auth)
  clientDb,   // Use for client-like operations if needed
  admin,
  clientApp
};
