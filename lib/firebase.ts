import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ SECURITY NOTE: In a real production app, use environment variables.
// For the hackathon, hardcoding this here fixes your "Invalid API Key" error instantly.
const firebaseConfig = {
  apiKey: "AIzaSyAqXWwX1c3yI6-gcLwY0V5gTMa4w8400io",
  authDomain: "financial-report-generat-62321.firebaseapp.com",
  projectId: "financial-report-generat-62321",
  storageBucket: "financial-report-generat-62321.firebasestorage.app",
  messagingSenderId:  "420829512424",
  appId: "1:420829512424:web:818ddccb29124d54c93f5d",
  measurementId: "G-15322KDWKD"
};

// Initialize Firebase
// We use this check to prevent "Firebase App named '[DEFAULT]' already exists" errors
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };