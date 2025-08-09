import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  

// Initialize Firebase if it hasn't been initialized yet
let firebaseApp: FirebaseApp | undefined;

export function initializeFirebase(): FirebaseApp {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    return firebaseApp;
  }
  return getApps()[0];
}

export async function initializeFirebaseIfNeeded(): Promise<FirebaseApp> {
  return initializeFirebase();
}

// Initialize Firebase at module level (for most cases)
initializeFirebase();

export default firebaseApp;