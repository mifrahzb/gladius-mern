import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadImage = async (filePath, folder = 'gladius') => {
  const res = await cloudinary.uploader.upload(filePath, { folder });
  try { fs.unlinkSync(filePath); } catch (e) {}
  return { url: res.secure_url, public_id: res.public_id };
};

export const deleteImage = async (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};
