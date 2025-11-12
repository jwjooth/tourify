// src/lib/firebase.ts (atau src/firebase.ts – konsisten ya)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Tambah ini buat auth

// Ambil config dari env vars – aman buat produksi
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Cek kalau config lengkap (error handling buat dev)
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase config tidak lengkap! Cek .env file.");
}

// Init app dengan cegah ganda
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics opsional
isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

// Export instances – siap pakai di app
export const db = getFirestore(app);
export const auth = getAuth(app); // Tambah ini buat auth email/Google
export { app }; // Opsional kalau butuh