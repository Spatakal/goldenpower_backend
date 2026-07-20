import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging"; // 👈 Add this import
import fs from "fs";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

// Initialize messaging service
const messaging = getMessaging(app);

// Export 'messaging' so the controller can use it
export { app, messaging };