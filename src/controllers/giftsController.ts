import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { giftsCollection, storage } from "../services/firebase";
import { GiftModel } from "../types";
import { getBytes, ref } from "firebase/storage";
import { GetGiftsFromCache, SetGiftsOnCache } from "../services/gifts/cache";
import { compressImageFromBase64, compressImageFromPath, saveImageToFirebaseStorage } from "../services/gifts/giftsService";

const giftsCached: GiftModel[] = GetGiftsFromCache();

export const getAllgiftsAsync = async () => {
  if (giftsCached.length === 0) {
    const giftsSnap = await getDocs(giftsCollection);
    const gifts = giftsSnap.docs.map(item => item.data()) as GiftModel[];

    const processedGifts = await Promise.all(
      gifts.map(async (item: GiftModel) => {
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

/**
* Add new gift to event
* 
*/
export const addGiftsAsync = async (payload: GiftModel, fileName: string) => {
  const compressedImageBuffer = await compressImageFromBase64(payload.image!);
  const imageUrl = await saveImageToFirebaseStorage(compressedImageBuffer?.buffer!, fileName, payload.eventId!);

  const entity = {
    ...payload,
    image: imageUrl
  }

  try {
    await addDoc(giftsCollection, entity);
    return true;
  } catch (e) {
    console.error(`Error add new gift: ${fileName}`, e);
    return false;
  }
}

/**
* Update a especific gift to event
* 
*/
export const updateGiftsAsync = async (payload: GiftModel, fileName: string) => {
  const compressedImageBuffer = await compressImageFromBase64(payload.image!);
  const imageUrl = await saveImageToFirebaseStorage(compressedImageBuffer?.buffer!, fileName, payload.eventId!);

  try {
    const giftQuery = query(
      giftsCollection,
      where("id", "==", payload.id)
    );

    const querySnap = await getDocs(giftQuery);
    if (querySnap) {

      const entity = {
        ...payload,
        image: imageUrl
      }

      await updateDoc(querySnap.docs[0].ref, entity);
      return true;
    }
    console.log("Gift not found for update")
    return false;
  } catch (e) {
    console.error(`Error update gift: ${fileName}`, e);
    return false;
  }
}

/**
* Remove a gift from event
* 
*/
export const removeGiftsAsync = async (giftId: string) => {
  try {
    const giftQuery = query(
      giftsCollection,
      where("id", "==", giftId)
    );

    const querySnap = await getDocs(giftQuery);
    querySnap.forEach(async (item) => {
      await deleteDoc(item.ref);
    })
    return true;
  } catch (e) {
    console.error("Error remove new gift: ", e);
    return false;
  }
}

export const addGiftsToCache = async () => {
  console.info("[SCHEDULED] - Searching gifts updates");
  const gifts = await getAllgiftsAsync();
  SetGiftsOnCache(gifts);
  console.info(`[SCHEDULED] - ${gifts?.length} gifts was found`);
};
