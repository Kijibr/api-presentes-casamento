import sharp from "sharp";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

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
/**
 * Convert a base64 image to WebP
 * @param {string} base64 - String base64 representando a imagem.
 * @returns {Promise<string>} - Imagem WebP convertida em base64.
 */
export async function compressImageFromBase64(base64Image: string) {
  try {
    const base64Data: string = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer: Buffer<ArrayBuffer> = Buffer.from(base64Data, 'base64');

    const outputBuffer = await sharp(buffer)
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

/**
 * Salva uma imagem no storage do Firebase e retorna a URL da imagem.
 * @param {ArrayBuffer} imageBuffer - O buffer da imagem a ser salva.
 * @param {string} fileName - O nome do arquivo a ser salvo no storage.
 * @returns {Promise<string>} - URL da imagem salva no storage.
 */
export async function saveImageToFirebaseStorage(imageBuffer: ArrayBuffer, fileName: string, eventId: string): Promise<string> {
  try {
    const storageRef = ref(storage, `/images/${eventId}/${fileName}`);
    const uint8Array = new Uint8Array(imageBuffer);

    // Faz o upload da imagem
    await uploadBytes(storageRef, uint8Array);

    // Obtém a URL da imagem
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error saving image to Firebase Storage:', error);
    throw new Error('Failed to save the image.');
  }
}