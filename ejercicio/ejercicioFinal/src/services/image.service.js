import sharp from 'sharp';

export const optimizeSignatureImage = async (buffer) => {
  return sharp(buffer)
    .resize({
      width: 800,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 82 })
    .toBuffer();
};
