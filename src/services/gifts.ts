import { addDoc, getDocs } from "firebase/firestore/lite";
import { giftsCollection } from "./firebase";
import { GiftType } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const getAllgifts = async () => {
  const giftsSnap = await getDocs(giftsCollection);

  const result = giftsSnap.docs.map(item => item.data()) as GiftType[];
  return result;
}

export const addGifts = async (payload: GiftType) => {
  try {
    await addDoc(giftsCollection, {
      ...payload,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      giftValue: parseFloat(payload.giftValue)
    });
  } catch (e) {
    console.error("Error save new payer: ", e);
  }
}