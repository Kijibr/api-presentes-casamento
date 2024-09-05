import { addDoc, getDocs } from "firebase/firestore/lite";
import { guestsCollection } from "./firebase";

export const getAllGuests = async () => {
  const guestsSnap = await getDocs(guestsCollection);

  const result = guestsSnap.docs.map(item => item.data());
  return result;
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