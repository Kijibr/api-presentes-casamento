import { addDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { guestsCollection } from "./firebase";
import { GuestType } from "../types";

export const getAllGuests = async () => {
  const guestsSnap = await getDocs(guestsCollection);

  const result = guestsSnap.docs.map(item => item.data());
  return result;
}

export const getGuest = async (userId: string) => {
  const payerQuery = query(guestsCollection, where("id", "==", userId));
  const payer = await getDocs(payerQuery);

  if (!payer.empty)
    return payer.docs[0].data() as GuestType;
}

export const markResponseAsync = async (userId: string, password: string, confirmed: boolean) => {
  const payerQuery = query(
    guestsCollection,
    where("id", "==", userId),
    where("password", "==", password)
  );
  
  const querySnap = await getDocs(payerQuery);
  
  if (!querySnap.empty) {
    const guestRef = querySnap.docs[0].ref;

    await updateDoc(guestRef, { confirmed });
    return true;
  }
  return false;
}

export const addNewGuest = async (name: string) => {
  try {
    await addDoc(guestsCollection, {
      name,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}