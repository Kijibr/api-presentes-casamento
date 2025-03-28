import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { giftsCollection, storage } from "../services/firebase";
import { GiftModel } from "../types";
import { getBytes, ref } from "firebase/storage";
import { GetGiftsFromCache, SetGiftsOnCache } from "../services/gifts/cache";
import { compressImageFromBase64, compressImageFromPath, saveImageToFirebaseStorage } from "../services/gifts/giftsService";
import { LogError, LogInformation } from "../services/logger";

const giftsCached: GiftModel[] = GetGiftsFromCache();

export const getAllgiftsAsync = async () => {
  try {
    if (giftsCached.length === 0) {
      const giftsSnap = await getDocs(giftsCollection);
      const gifts = giftsSnap.docs.map(item => item.data()) as GiftModel[];

      const processedGifts = await Promise.all(
        gifts.map(async (item: GiftModel) => {
          try {
            if (!item.image) {
              return item;
            }

            const fileReference = ref(storage, item.image);
            const imageBuffer = await getBytes(fileReference);
            const compressed = await compressImageFromPath(imageBuffer);
            
            return {
              ...item,
              image: `data:image/jpeg;base64,${compressed?.toString('base64')}`
            };
          } catch (error) {
            LogError(`Error processing image ${item.name}: ${error}`);
            return item;
          }
        })
      );

      giftsCached.push(...processedGifts);
      SetGiftsOnCache(giftsCached);
    }

    return giftsCached;
  } catch (error) {
    LogError(`Error getting all gifts: ${error}`);
    throw new Error("Error fetching gifts");
  }
}

/**
* Add new gift to event
* 
*/
export const addGiftsAsync = async (payload: GiftModel, fileName: string) => {
  try {
    if (!payload || !payload.name || !payload.price || !payload.eventId) {
      throw new Error("Invalid gift data");
    }

    if (!fileName) {
      throw new Error("File name not provided");
    }

    let imageUrl = payload.image;
    if (payload.image) {
      const compressedImageBuffer = await compressImageFromBase64(payload.image);
      if (!compressedImageBuffer) {
        throw new Error("Error compressing image");
      }
      imageUrl = await saveImageToFirebaseStorage(compressedImageBuffer.buffer, fileName, payload.eventId);
    }

    const entity = {
      ...payload,
      image: imageUrl
    };

    await addDoc(giftsCollection, entity);
    return true;
  } catch (e) {
    LogError(`Error adding new gift: ${e}`);
    throw new Error("Error adding gift");
  }
}

/**
* Update a especific gift to event
* 
*/
export const updateGiftsAsync = async (payload: GiftModel, fileName: string) => {
  try {
    if (!payload || !payload.id || !payload.name || !payload.price || !payload.eventId) {
      throw new Error("Invalid gift data");
    }

    let imageUrl = payload.image;
    if (payload.image) {
      const compressedImageBuffer = await compressImageFromBase64(payload.image);
      if (!compressedImageBuffer) {
        throw new Error("Error compressing image");
      }
      imageUrl = await saveImageToFirebaseStorage(compressedImageBuffer.buffer, fileName, payload.eventId);
    }

    const giftQuery = query(
      giftsCollection,
      where("id", "==", payload.id)
    );

    const querySnap = await getDocs(giftQuery);
    if (!querySnap.empty) {
      const entity = {
        ...payload,
        image: imageUrl
      };

      await updateDoc(querySnap.docs[0].ref, entity);
      return true;
    }

    LogError(`Gift not found for update: ${payload.id}`);
    return false;
  } catch (e) {
    LogError(`Error updating gift: ${e}`);
    throw new Error("Error updating gift");
  }
}

/**
* Remove a gift from event
* 
*/
export const removeGiftsAsync = async (giftId: string) => {
  try {
    if (!giftId) {
      throw new Error("Gift ID not provided");
    }

    const giftQuery = query(
      giftsCollection,
      where("id", "==", giftId)
    );

    const querySnap = await getDocs(giftQuery);
    if (querySnap.empty) {
      LogError(`Gift not found for removal: ${giftId}`);
      return false;
    }

    await Promise.all(querySnap.docs.map(doc => deleteDoc(doc.ref)));
    return true;
  } catch (e) {
    LogError(`Error removing gift: ${e}`);
    throw new Error("Error removing gift");
  }
}

export const addGiftsToCache = async () => {
  LogInformation("[SCHEDULED] - Searching for gift updates");
  const gifts = await getAllgiftsAsync();
  SetGiftsOnCache(gifts);
  LogInformation(`[SCHEDULED] - ${gifts?.length} gifts were found`);
};
