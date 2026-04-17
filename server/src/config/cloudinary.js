import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Storage for dataset files
const datasetStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'open-data/datasets',
    resource_type: 'auto',
    allowed_formats: ['csv', 'json', 'geojson', 'parquet', 'xlsx', 'xls', 'pdf', 'zip', 'png', 'jpg', 'jpeg', 'tif', 'tiff'],
  },
})

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'open-data/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
})

export const uploadDatasetFiles = multer({ 
  storage: datasetStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
})

export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export { cloudinary }
