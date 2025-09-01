import * as Storage  from './storageService';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates the image file
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Unsupported file format. Please upload a JPG, PNG, or WebP image.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File is too large. Maximum size is 5MB.'
    };
  }

  return { valid: true };
};

/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string of the file
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compresses an image file while maintaining aspect ratio
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width of the output image
 * @param {number} options.maxHeight - Maximum height of the output image
 * @param {number} options.quality - Output quality (0.1 - 1.0)
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file, { 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.8 
} = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(
            new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
          );
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Uploads an image file
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, key: string}>} Upload result
 */
export const uploadImage = async (file) => {
  try {
    // In a real app, you would upload to a server here
    // For now, we'll just return a data URL
    const base64 = await fileToBase64(file);
    // Generate a unique key for the image
    const key = `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real app, you would upload to your storage here
    // await Storage.uploadFile(key, file);
    
    // For now, we'll just store the base64 data
    await Storage.set(key, base64);
    
    return {
      url: base64,
      key,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Deletes an uploaded image
 * @param {string} key - The key of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (key) => {
  try {
    // In a real app, you would delete from your storage here
    // await Storage.deleteFile(key);
    
    // For now, we'll just remove from local storage
    await Storage.remove(key);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Gets the URL for an uploaded image
 * @param {string} key - The key of the image
 * @returns {Promise<string>} The image URL
 */
export const getImageUrl = async (key) => {
  if (!key) return null;
  
  try {
    // In a real app, you would get a signed URL from your storage
    // return await Storage.getFileUrl(key);
    
    // For now, we'll just get the base64 data from local storage
    return await Storage.get(key);
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};
