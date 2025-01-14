import sharp from "sharp";

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

export async function compressImageFromBase64(base64Image: string) {
  try {
    const binary = atob(base64Image);
    const len = binary.length;
    const formatted = new Uint8Array(len);
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
