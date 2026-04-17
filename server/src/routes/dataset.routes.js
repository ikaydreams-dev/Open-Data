import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth.js'
import { uploadDatasetFiles } from '../config/cloudinary.js'
import {
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  deleteDataset,
  likeDataset,
  unlikeDataset,
  downloadFile,
  getFilePreview,
  getVersions,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/dataset.controller.js'

const router = Router()

// Public routes (with optional auth for user-specific data)
router.get('/', optionalAuth, listDatasets)
router.get('/:slug', optionalAuth, getDataset)
router.get('/:slug/versions', getVersions)
router.get('/:slug/reviews', getReviews)
router.get('/:slug/files/:fileId/preview', getFilePreview)
router.get('/:slug/files/:fileId/download', optionalAuth, downloadFile)

// Protected routes
router.post('/', authenticate, uploadDatasetFiles.array('files', 10), createDataset)
router.put('/:slug', authenticate, updateDataset)
router.delete('/:slug', authenticate, deleteDataset)

// Likes
router.post('/:slug/like', authenticate, likeDataset)
router.delete('/:slug/like', authenticate, unlikeDataset)

// Reviews
router.post('/:slug/reviews', authenticate, createReview)
router.put('/:slug/reviews/:reviewId', authenticate, updateReview)
router.delete('/:slug/reviews/:reviewId', authenticate, deleteReview)

export default router
