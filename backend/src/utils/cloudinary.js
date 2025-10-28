import cloudinary from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with credentials from .env
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload single image to Cloudinary
 * @param {Object} file - File object from multer middleware
 * @returns {Object} { url, public_id }
 */
export const uploadImage = async (file) => {
  try {
    console.log('📤 Uploading to Cloudinary:', file.path);
    
    // Upload to Cloudinary with optimizations
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'gladius-knives', // Organize in folder
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Max 1000x1000
        { quality: 'auto:good' }, // Auto quality optimization
        { fetch_format: 'auto' } // Auto format (WebP for modern browsers)
      ],
      resource_type: 'image'
    });
    
    console.log('✅ Uploaded successfully:', result.secure_url);
    
    // Delete local file after successful upload
    fs.unlinkSync(file.path);
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
    
  } catch (error) {
    // Delete local file even if upload failed
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    console.error('❌ Cloudinary upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file objects from multer
 * @returns {Array} Array of { url, public_id }
 */
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public_id (e.g., "gladius-knives/abc123")
 * @returns {Object} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    console.log('🗑️  Deleting from Cloudinary:', publicId);
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log('✅ Deleted successfully');
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Delete multiple images
 * @param {Array} publicIds - Array of public_ids
 * @returns {Array} Deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => deleteImage(id));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('❌ Multiple delete error:', error);
    throw new Error('Failed to delete images');
  }
};

export default cloudinary;