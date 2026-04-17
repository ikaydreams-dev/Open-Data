import { uploadDatasetFiles, uploadProfileImage } from '../config/cloudinary.js';

// Wraps the multer middleware to handle potential multer errors locally if needed
export const handleDatasetUpload = uploadDatasetFiles.array('files', 5);
export const handleProfileUpload = uploadProfileImage.single('avatar');

export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  next(err);
};