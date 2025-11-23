const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Make sure this path is correct
const dotenv = require('dotenv');
dotenv.config();

const serviceAccount = {
  type: process.env.FIRESTORE_TYPE,
  project_id: process.env.FIRESTORE_PROJECT_ID,
  private_key_id: process.env.FIRESTORE_PRIVATE_KEY_ID,
  private_key: process.env.FIRESTORE_PRIVATE_KEY,
  client_email: process.env.FIRESTORE_CLIENT_EMAIL,
  client_id: process.env.FIRESTORE_CLIENT_ID,
  auth_uri: process.env.FIRESTORE_AUTH_URI,
  token_uri: process.env.FIRESTORE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIRESTORE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIRESTORE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIRESTORE_UNIVERSE_DOMAIN
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// const { requestLogger, errorLogger, cleanupOldLogs } = require('./middleware/logger');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const journalRoutes = require('./routes/journal');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://172.16.68.240:8081',
  ]
}

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/journals', journalRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
