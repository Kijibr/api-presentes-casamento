import sharp from "sharp";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { LogError } from "../logger";

/**
 * Comprime uma imagem a partir de um caminho fornecido.
 * 
 * Este método utiliza a biblioteca Sharp para redimensionar e converter a imagem
 * para o formato WebP. A imagem resultante terá uma largura máxima de 1920 pixels
 * e uma altura máxima de 1080 pixels, mantendo a proporção original. A qualidade
 * da imagem WebP gerada será de 80%.
 * 
 * @param {ArrayBuffer} imagePath - O caminho da imagem a ser comprimida, representado como um ArrayBuffer.
 * @returns {Promise<Buffer | undefined>} - Um buffer contendo a imagem comprimida em formato WebP, ou undefined em caso de erro.
 */
export async function compressImageFromPath(imagePath: ArrayBuffer) {
  try {
    if (!imagePath || imagePath.byteLength === 0) {
      throw new Error("Invalid image buffer");
    }

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

    if (!outputBuffer || outputBuffer.length === 0) {
      throw new Error("Failed to compress image");
    }

    return outputBuffer;
  } catch (error) {
    LogError(`Error processing image: ${error}`);
    throw new Error("Failed to process image");
  }
}

/**
 * Convert a base64 image to WebP
 * @param {string} base64 - String base64 representando a imagem.
 * @returns {Promise<string>} - Imagem WebP convertida em base64.
 */
export async function compressImageFromBase64(base64Image: string) {
  try {
    if (!base64Image) {
      throw new Error("Base64 image not provided");
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    if (!base64Data) {
      throw new Error("Invalid base64 image format");
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (!buffer || buffer.length === 0) {
      throw new Error("Failed to convert base64 to buffer");
    }

    const outputBuffer = await sharp(buffer)
      .resize({
        width: 1920,
        height: 1080,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    if (!outputBuffer || outputBuffer.length === 0) {
      throw new Error("Failed to compress image");
    }

    return outputBuffer;
  } catch (error) {
    LogError(`Error processing base64 image: ${error}`);
    throw new Error("Failed to process image");
  }
}

/**
 * Salva uma imagem no storage do Firebase e retorna a URL da imagem.
 * @param {ArrayBuffer} imageBuffer - O buffer da imagem a ser salva.
 * @param {string} fileName - O nome do arquivo a ser salvo no storage.
 * @returns {Promise<string>} - URL da imagem salva no storage.
 */
export async function saveImageToFirebaseStorage(imageBuffer: ArrayBuffer, fileName: string, eventId: string): Promise<string> {
  try {
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new Error("Invalid image buffer");
    }

    if (!fileName || !eventId) {
      throw new Error("File name or event ID not provided");
    }

    const storageRef = ref(storage, `/images/${eventId}/${fileName}`);
    const uint8Array = new Uint8Array(imageBuffer);

    await uploadBytes(storageRef, uint8Array);
    const downloadURL = await getDownloadURL(storageRef);

    if (!downloadURL) {
      throw new Error("Failed to get image URL");
    }

    return downloadURL;
  } catch (error) {
    LogError(`Error saving image to Firebase Storage: ${error}`);
    throw new Error("Failed to save image");
  }
}