import { Dataset, DatasetVersion, DatasetLike, DatasetDownload, Review } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'
import { calculateQualityScore } from './quality.service.js'

/**
 * Fetch a paginated list of datasets with optional filters.
 */
export async function listDatasets({ query = {}, sort = 'newest', page = 1, limit = 20 }) {
  let sortOption = { createdAt: -1 }
  if (sort === 'downloads') sortOption = { downloadCount: -1 }
  if (sort === 'likes') sortOption = { likeCount: -1 }
  if (sort === 'oldest') sortOption = { createdAt: 1 }

  const skip = (page - 1) * limit

  const [datasets, total] = await Promise.all([
    Dataset.find(query)
      .select('-files.previewData -files.columns')
      .populate('uploader', 'name username avatar')
      .populate('organization', 'name slug logo')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Dataset.countDocuments(query),
  ])

  return {
    datasets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Fetch a single dataset by slug and check access for the requesting user.
 */
export async function getDatasetBySlug(slug, requestingUser) {
  const dataset = await Dataset.findOne({ slug })
    .populate('uploader', 'name username avatar')
    .populate('organization', 'name slug logo')
    .populate('moderatedBy', 'name')

  if (!dataset) throw new AppError('Dataset not found', 404)

  const isPublicApproved = dataset.visibility === 'public' && dataset.moderationStatus === 'approved'
  if (!isPublicApproved) {
    if (!requestingUser) throw new AppError('Access denied', 403)
    const isOwner = dataset.uploader._id.toString() === requestingUser._id.toString()
    const isAdmin = requestingUser.role === 'admin'
    if (!isOwner && !isAdmin) throw new AppError('Access denied', 403)
  }

  let likedByMe = false
  if (requestingUser) {
    const like = await DatasetLike.findOne({ dataset: dataset._id, user: requestingUser._id })
    likedByMe = !!like
  }

  await Dataset.updateOne({ _id: dataset._id }, { $inc: { viewCount: 1 } })

  return { ...dataset.toObject(), likedByMe }
}

/**
 * Create a new dataset document and its initial version record.
 */
export async function createDataset({ fields, files, uploaderId, organizationId }) {
  const dataset = new Dataset({
    ...fields,
    files,
    uploader: uploaderId,
    organization: organizationId,
  })

  dataset.qualityScore = calculateQualityScore(dataset, files)
  await dataset.save()

  await DatasetVersion.create({
    dataset: dataset._id,
    versionNumber: 1,
    changelog: 'Initial upload',
    files: files.map((f) => ({
      name: f.name,
      url: f.url,
      publicId: f.publicId,
      format: f.format,
      size: f.size,
    })),
    createdBy: uploaderId,
  })

  return Dataset.findById(dataset._id)
    .populate('uploader', 'name username avatar')
    .populate('organization', 'name slug logo')
}

/**
 * Update allowed fields on a dataset and recalculate its quality score.
 */
export async function updateDataset(slug, updates, requestingUser) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const isOwner = dataset.uploader.toString() === requestingUser._id.toString()
  const isAdmin = requestingUser.role === 'admin'
  if (!isOwner && !isAdmin) throw new AppError('You can only edit your own datasets', 403)

  const allowed = [
    'title', 'description', 'category', 'license', 'visibility',
    'source', 'temporalCoverage', 'methodology', 'tags', 'geographicScope',
  ]
  allowed.forEach((field) => {
    if (updates[field] !== undefined) dataset[field] = updates[field]
  })

  dataset.qualityScore = calculateQualityScore(dataset, dataset.files)
  await dataset.save()

  return Dataset.findById(dataset._id)
    .populate('uploader', 'name username avatar')
    .populate('organization', 'name slug logo')
}

/**
 * Delete a dataset and all associated records (versions, likes, reviews).
 */
export async function deleteDataset(slug, requestingUser) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const isOwner = dataset.uploader.toString() === requestingUser._id.toString()
  const isAdmin = requestingUser.role === 'admin'
  if (!isOwner && !isAdmin) throw new AppError('You can only delete your own datasets', 403)

  // TODO: delete files from Cloudinary using cloudinary.service.js
  await Promise.all([
    Dataset.deleteOne({ _id: dataset._id }),
    DatasetVersion.deleteMany({ dataset: dataset._id }),
    DatasetLike.deleteMany({ dataset: dataset._id }),
    Review.deleteMany({ dataset: dataset._id }),
  ])
}

/**
 * Like a dataset. Throws if already liked.
 */
export async function likeDataset(slug, userId) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const existing = await DatasetLike.findOne({ dataset: dataset._id, user: userId })
  if (existing) throw new AppError('Already liked this dataset', 400)

  await DatasetLike.create({ dataset: dataset._id, user: userId })
  await Dataset.updateOne({ _id: dataset._id }, { $inc: { likeCount: 1 } })

  return { likeCount: dataset.likeCount + 1 }
}

/**
 * Unlike a dataset. Throws if not previously liked.
 */
export async function unlikeDataset(slug, userId) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const like = await DatasetLike.findOneAndDelete({ dataset: dataset._id, user: userId })
  if (!like) throw new AppError('Not liked yet', 400)

  await Dataset.updateOne({ _id: dataset._id }, { $inc: { likeCount: -1 } })

  return { likeCount: Math.max(0, dataset.likeCount - 1) }
}

/**
 * Log a file download and return the download URL.
 */
export async function downloadFile(slug, fileId, requestingUser, ipAddress, userAgent) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const file = dataset.files.id(fileId)
  if (!file) throw new AppError('File not found', 404)

  await DatasetDownload.create({
    dataset: dataset._id,
    file: fileId,
    user: requestingUser?._id,
    ipAddress,
    userAgent,
  })
  await Dataset.updateOne({ _id: dataset._id }, { $inc: { downloadCount: 1 } })

  return { url: file.url, name: file.name }
}

/**
 * Return file metadata and preview data for a specific file.
 */
export async function getFilePreview(slug, fileId) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const file = dataset.files.id(fileId)
  if (!file) throw new AppError('File not found', 404)

  return {
    name: file.name,
    format: file.format,
    size: file.size,
    rowCount: file.rowCount,
    columnCount: file.columnCount,
    columns: file.columns || [],
    previewData: file.previewData || [],
  }
}

/**
 * Fetch version history for a dataset.
 */
export async function getVersions(slug) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const versions = await DatasetVersion.find({ dataset: dataset._id })
    .populate('createdBy', 'name username')
    .sort({ versionNumber: -1 })

  return versions
}

/**
 * Fetch reviews and compute average rating.
 */
export async function getReviews(slug) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const reviews = await Review.find({ dataset: dataset._id })
    .populate('user', 'name username avatar')
    .sort({ createdAt: -1 })

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return { reviews, avgRating }
}

/**
 * Create a new review. Throws if user already reviewed this dataset.
 */
export async function createReview(slug, userId, { rating, comment }) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const existing = await Review.findOne({ dataset: dataset._id, user: userId })
  if (existing) throw new AppError('You have already reviewed this dataset', 400)

  const review = await Review.create({ dataset: dataset._id, user: userId, rating, comment })

  return Review.findById(review._id).populate('user', 'name username avatar')
}

/**
 * Update a review owned by the requesting user.
 */
export async function updateReview(slug, reviewId, userId, { rating, comment }) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const review = await Review.findById(reviewId)
  if (!review) throw new AppError('Review not found', 404)
  if (review.user.toString() !== userId.toString()) throw new AppError('You can only edit your own reviews', 403)

  if (rating !== undefined) review.rating = rating
  if (comment !== undefined) review.comment = comment
  await review.save()

  return Review.findById(review._id).populate('user', 'name username avatar')
}

/**
 * Delete a review. Owner or admin only.
 */
export async function deleteReview(slug, reviewId, requestingUser) {
  const dataset = await Dataset.findOne({ slug })
  if (!dataset) throw new AppError('Dataset not found', 404)

  const review = await Review.findById(reviewId)
  if (!review) throw new AppError('Review not found', 404)

  const isOwner = review.user.toString() === requestingUser._id.toString()
  const isAdmin = requestingUser.role === 'admin'
  if (!isOwner && !isAdmin) throw new AppError('You can only delete your own reviews', 403)

  await Review.deleteOne({ _id: reviewId })
}
