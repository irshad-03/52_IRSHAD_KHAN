import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ SECURITY NOTE: In a real production app, use environment variables.
// For the hackathon, hardcoding this here fixes your "Invalid API Key" error instantly.
const firebaseConfig = {
  apiKey: "----",
  authDomain: "----",
  projectId: "----",
  storageBucket: "----",
  messagingSenderId: "----",
  appId: "----",
  measurementId: "----"
};

// Initialize Firebase
// We use this check to prevent "Firebase App named '[DEFAULT]' already exists" errors
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };