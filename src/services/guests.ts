import { addDoc, getDocs, query, where } from "firebase/firestore/lite";
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

export const addNewGuest = async (name: string) => {
  try {
    await addDoc(guestsCollection, {
      name,
      age: 22
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}