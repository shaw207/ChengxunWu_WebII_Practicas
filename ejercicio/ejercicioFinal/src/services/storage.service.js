import { Readable } from 'node:stream';
import cloudinary, { assertCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/index.js';

const uploadBuffer = async (buffer, options = {}) => {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
};

export const uploadSignatureImage = async ({ buffer, deliveryNoteId }) => {
  const result = await uploadBuffer(buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/signatures`,
    public_id: `signature-${deliveryNoteId}-${Date.now()}`,
    resource_type: 'image',
    format: 'webp'
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};

export const uploadDeliveryNotePdf = async ({ buffer, deliveryNoteId }) => {
  const result = await uploadBuffer(buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/deliverynotes`,
    public_id: `deliverynote-${deliveryNoteId}-${Date.now()}`,
    resource_type: 'raw',
    format: 'pdf'
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};
