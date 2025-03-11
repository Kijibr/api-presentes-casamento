import { initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";
import { collection, getFirestore } from 'firebase/firestore/lite';
import { appConfig } from '../config/keys';

const firebaseConfig = {
  fbApiKey: appConfig.fbApiKey,
  authDomain: appConfig.fbAuthDomain,
  projectId: appConfig.fbProjectId,
  storageBucket: appConfig.storageBucket,
  fbMessagingSenderId: appConfig.fbMessagingSenderId,
  fbAppId: appConfig.fbAppId,
  fbMeasurementId: appConfig.fbMeasurementId,
};

const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);
export const database = getFirestore(firebaseApp);
export const guestsCollection = collection(database, 'guests');
export const paymentsCollection = collection(database, 'payments');
export const giftsCollection = collection(database, 'gifts');