import { GiftModel } from "../../types";
import { giftsCollection } from "../firebase";
import { LogError } from "../logger";
import { uploadGiftImage, deleteGiftImage } from "../firebase/storage";
import { 
  CollectionReference, 
  DocumentReference, 
  DocumentSnapshot, 
  QuerySnapshot,
  DocumentData,
  Firestore 
} from "firebase-admin/firestore";

type GiftCollection = CollectionReference<DocumentData, DocumentData>;

export async function addNewGift(gift: GiftModel, imageFile?: Express.Multer.File): Promise<string | null> {
  try {
    let image: string | undefined = undefined;

    if (imageFile) {
      const uploadedUrl = await uploadGiftImage(imageFile, gift.id);
      if (uploadedUrl) {
        image = uploadedUrl;
      } else {
        throw new Error("Failed to upload gift image");
      }
    }

    const giftWithImage = {
      ...gift,
      image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const collection = giftsCollection as unknown as GiftCollection;
    const docRef = collection.doc(gift.id);
    await docRef.set(giftWithImage);
    return gift.id;
  } catch (error) {
    LogError(`Error adding new gift: ${error}`);
    return null;
  }
}

export async function getGift(giftId: string): Promise<GiftModel | null> {
  try {
    const collection = giftsCollection as unknown as GiftCollection;
    const docRef = collection.doc(giftId);
    const giftDoc = await docRef.get();
    
    if (!giftDoc.exists) {
      return null;
    }

    return giftDoc.data() as GiftModel;
  } catch (error) {
    LogError(`Error getting gift: ${error}`);
    return null;
  }
}

export async function updateGift(giftId: string, gift: Partial<GiftModel>, imageFile?: Express.Multer.File): Promise<boolean> {
  try {
    const collection = giftsCollection as unknown as GiftCollection;
    const docRef = collection.doc(giftId);
    const giftDoc = await docRef.get();
    
    if (!giftDoc.exists) {
      return false;
    }

    const currentGift = giftDoc.data() as GiftModel;
    let image = currentGift.image;

    if (imageFile) {
      // Deletar imagem antiga se existir
      if (currentGift.image) {
        await deleteGiftImage(currentGift.image);
      }

      // Upload da nova imagem
      const uploadedUrl = await uploadGiftImage(imageFile, giftId);
      if (uploadedUrl) {
        image = uploadedUrl;
      } else {
        throw new Error("Failed to upload new gift image");
      }
    }

    const updatedGift = {
      ...gift,
      image,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedGift);
    return true;
  } catch (error) {
    LogError(`Error updating gift: ${error}`);
    return false;
  }
}

export async function deleteGift(giftId: string): Promise<boolean> {
  try {
    const collection = giftsCollection as unknown as GiftCollection;
    const docRef = collection.doc(giftId);
    const giftDoc = await docRef.get();
    
    if (!giftDoc.exists) {
      return false;
    }

    const gift = giftDoc.data() as GiftModel;
    
    // Deletar imagem se existir
    if (gift.image) {
      await deleteGiftImage(gift.image);
    }

    await docRef.delete();
    return true;
  } catch (error) {
    LogError(`Error deleting gift: ${error}`);
    return false;
  }
}

export async function getAllGifts(): Promise<GiftModel[]> {
  try {
    const collection = giftsCollection as unknown as GiftCollection;
    const giftsSnapshot = await collection.get();
    return giftsSnapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => doc.data() as GiftModel);
  } catch (error) {
    LogError(`Error getting all gifts: ${error}`);
    return [];
  }
} 