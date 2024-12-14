import { initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";
import { collection, getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: "app-casamento-6eb44.firebaseapp.com",
  projectId: "app-casamento-6eb44",
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);

export const database = getFirestore(firebaseApp);

export const guestsCollection = collection(database, 'guests');
export const paymentsCollection = collection(database, 'payments');
export const giftsCollection = collection(database, 'gifts');