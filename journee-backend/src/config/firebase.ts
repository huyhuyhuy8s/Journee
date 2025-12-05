import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin/app";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config } from "@/config/env";
import { readFileSync } from "fs";
import { join } from "path";

const serviceAccountKey = JSON.parse(
  readFileSync(
    join(process.cwd(), "src/secrets/serviceAccountKey.json"),
    "utf-8"
  )
);

const serviceAccount =
  config.NODE_ENV === "production"
    ? {
        type: config.FIRESTORE_ADMIN_TYPE,
        project_id: config.FIRESTORE_ADMIN_PROJECT_ID,
        private_key_id: config.FIRESTORE_ADMIN_PRIVATE_KEY_ID,
        private_key: config.FIRESTORE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: config.FIRESTORE_ADMIN_CLIENT_EMAIL,
        client_id: config.FIRESTORE_ADMIN_CLIENT_ID,
        auth_uri: config.FIRESTORE_ADMIN_AUTH_URI,
        token_uri: config.FIRESTORE_ADMIN_TOKEN_URI,
        auth_provider_x509_cert_url:
          config.FIRESTORE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: config.FIRESTORE_ADMIN_CLIENT_X509_CERT_URL,
        universe_domain: config.FIRESTORE_ADMIN_UNIVERSE_DOMAIN,
      }
    : serviceAccountKey;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: `https://${config.FIRESTORE_ADMIN_PROJECT_ID}.firebaseio.com`,
});

const adminDb: admin.firestore.Firestore = admin.firestore();

const firebaseOptions: FirebaseOptions = {
  apiKey: config.FIRESTORE_CLIENT_API_KEY,
  authDomain: config.FIRESTORE_CLIENT_AUTH_DOMAIN,
  projectId: config.FIRESTORE_ADMIN_PROJECT_ID,
  storageBucket: config.FIRESTORE_CLIENT_STORAGE_BUCKET,
  messagingSenderId: config.FIRESTORE_CLIENT_MESSAGING_SENDER_ID,
  appId: config.FIRESTORE_CLIENT_APP_ID,
  measurementId: config.FIRESTORE_CLIENT_MEASUREMENT_ID,
};

const clientApp: FirebaseApp = initializeApp(firebaseOptions);
const clientDb = getFirestore(clientApp);

export { adminDb, clientDb, admin, clientApp };
