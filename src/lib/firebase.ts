// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCh9D1Buu-Ks_Iyba7LWkiAIuod9io8zLk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fowardafrica-8cf73.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://fowardafrica-8cf73-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fowardafrica-8cf73",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fowardafrica-8cf73.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "475328888787",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:475328888787:web:3b2dfe1e8ebd691775b926",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3FYPVRN816"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if not already connected
  try {
    // Firestore emulator
    try {
      if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
    } catch {
      // Already connected
    }

    // Auth emulator
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
    } catch {
      // Already connected
    }

    // Storage emulator
    try {
      if (!(storage as any)._delegate._host.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
    } catch {
      // Already connected
    }

    // Connected to Firebase emulators (development). Suppress noisy message in console.
    console.debug('Connected to Firebase emulators (development)');
  } catch (error) {
    console.log('⚠️ Firebase emulators already connected or not available');
  }
}

// Initialize Analytics only on client side
let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('��️ Analytics not available:', error);
  }
}

export { db, auth, storage, analytics };
