import { addDoc, getDocs } from "firebase/firestore/lite";
import { giftsCollection, storage } from "./firebase";
import { GiftType } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { getBytes, ref } from "firebase/storage";
import sharp from "sharp";
import { scheduleJob } from "node-schedule";

const giftsCached: GiftType[] = [];

export const getAllgifts = async () => {
  if (giftsCached.length === 0) {
    const giftsSnap = await getDocs(giftsCollection);
    const gifts = giftsSnap.docs.map(item => item.data()) as GiftType[];

    const processedGifts = await Promise.all(
      gifts.map(async (item: GiftType) => {
        try {
          const fileReference = ref(storage, item.image!);

          const imageBuffer = await getBytes(fileReference);
          const compressed = await compressImage(imageBuffer);
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

async function compressImage(imagePath: ArrayBuffer) {
  try {
    const formatted = new Uint8Array(imagePath);
    const outputBuffer = await sharp(formatted)
      .resize({
        width: 1920,
        height: 1080,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    return outputBuffer;
  } catch (error) {
    console.error('Erro on processing image:', error);
  }
}

scheduleJob("*/5 * * * *", async () => {
  console.info("[SCHEDULED] - Searching gifts updates");
  await getAllgifts();
  console.info("[SCHEDULED] - Gifts was updated");
});
