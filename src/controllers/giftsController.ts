import { addDoc, getDocs } from "firebase/firestore/lite";
import { giftsCollection, storage } from "../services/firebase";
import { GiftType } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { getBytes, ref } from "firebase/storage";
import { GetGiftsFromCache, SetGiftsOnCache } from "../services/gifts/cache";
import { compressImageFromBase64, compressImageFromPath } from "../services/gifts/giftsService";

const giftsCached: GiftType[] = GetGiftsFromCache();

export const getAllgifts = async () => {
  if (giftsCached.length === 0) {
    const giftsSnap = await getDocs(giftsCollection);
    const gifts = giftsSnap.docs.map(item => item.data()) as GiftType[];

    const processedGifts = await Promise.all(
      gifts.map(async (item: GiftType) => {
        try {
          const fileReference = ref(storage, item.image!);

          const imageBuffer = await getBytes(fileReference);
          const compressed = await compressImageFromPath(imageBuffer);
          return {
            ...item,
            image: `data:image/jpeg;base64,${compressed?.toString('base64')}`
          };

        } catch (error) {
          console.error(`Error processing image ${item.name}:`, error);
          return item;
        }
      })
    );

    giftsCached.push(...processedGifts);
  }

  return giftsCached;
}

export const addGifts = async (payload: GiftType) => {
  const compressedImage = compressImageFromBase64(payload.image!);

  try {
    await addDoc(giftsCollection, {
      ...payload,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      price: parseFloat(payload.price),
      image: compressedImage
    });
    return true;
  } catch (e) {
    console.error("Error save new payer: ", e);
    return false;
  }
}

export const addGiftsToCache = async () => {
  console.info("[SCHEDULED] - Searching gifts updates");
  const gifts = await getAllgifts();
  SetGiftsOnCache(gifts);
  console.info(`[SCHEDULED] - ${gifts?.length} gifts was found`);
};
