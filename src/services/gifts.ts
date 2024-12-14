import { addDoc, getDocs } from "firebase/firestore/lite";
import { giftsCollection, storage } from "./firebase";
import { GiftType } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { getBytes, ref } from "firebase/storage";


const giftsCached: GiftType[] = [];

export const getAllgifts = async () => {
  if (giftsCached.length === 0) {
    const giftsSnap = await getDocs(giftsCollection);
    const result = giftsSnap.docs.map(item => item.data()) as GiftType[];
    result.forEach((item: GiftType) => {
      const fileReference = ref(storage, item.image!);

      getBytes(fileReference).then((imageBuffer: ArrayBuffer) => {
        const base64 = Buffer.from(imageBuffer).toString('base64');

        item.image = `data:image/jpeg;base64,${base64}`;
      });
      return giftsCached.push(item)
    }
    );
  }

  return giftsCached;
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