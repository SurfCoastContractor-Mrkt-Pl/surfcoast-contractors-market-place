import { base44 } from '@/api/base44Client';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'text/plain'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate and upload a file
 */
export const uploadFile = async (file, type = 'image') => {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;

  // Validate type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Upload
  const result = await base44.integrations.Core.UploadFile({ file });
  return result.file_url;
};

/**
 * Create a signed URL for private file download
 */
export const createSignedUrl = async (fileUri, expiresIn = 3600) => {
  const result = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: fileUri,
    expires_in: expiresIn,
  });
  return result.signed_url;
};