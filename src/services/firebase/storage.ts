import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { LogError } from '../logger';
import { storage } from '../firebase';

export async function uploadGiftImage(file: Express.Multer.File, giftId: string): Promise<string | null> {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${giftId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `gifts/${fileName}`);

    await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000', // Cache por 1 ano
    });

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    LogError(`Error uploading gift image: ${error}`);
    return null;
  }
}

export async function deleteGiftImage(imageUrl: string): Promise<boolean> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    LogError(`Error deleting gift image: ${error}`);
    return false;
  }
}

export async function getGiftImageUrl(imagePath: string): Promise<string | null> {
  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    LogError(`Error getting gift image URL: ${error}`);
    return null;
  }
} 