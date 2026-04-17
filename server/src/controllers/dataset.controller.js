import { parse } from 'csv-parse/sync'
import { Dataset, DatasetVersion, DatasetLike, DatasetDownload, Review } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

// Calculate quality score based on dataset completeness
function calculateQualityScore(dataset, files) {
  const scores = {
    completeness: 0,
    documentation: 0,
    freshness: 0,
    format: 0,
  }

  // Completeness: Check required fields
  let completenessPoints = 0
  if (dataset.title) completenessPoints += 15
  if (dataset.description && dataset.description.length > 50) completenessPoints += 20
  if (dataset.category) completenessPoints += 10
  if (dataset.license) completenessPoints += 10
  if (dataset.geographicScope?.length > 0) completenessPoints += 15
  if (dataset.temporalCoverage) completenessPoints += 15
  if (dataset.source) completenessPoints += 10
  if (dataset.tags?.length > 0) completenessPoints += 5
  scores.completeness = Math.min(completenessPoints, 100)

  // Documentation: Check file metadata
  let docPoints = 0
  if (dataset.description && dataset.description.length > 200) docPoints += 30
  if (dataset.methodology) docPoints += 30
  const filesWithColumns = files.filter(f => f.columns?.length > 0)
  docPoints += Math.min((filesWithColumns.length / Math.max(files.length, 1)) * 40, 40)
  scores.documentation = Math.min(docPoints, 100)

  // Freshness: Based on update date
  const daysSinceUpdate = (Date.now() - new Date(dataset.updatedAt || dataset.createdAt)) / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate < 30) scores.freshness = 100
  else if (daysSinceUpdate < 90) scores.freshness = 80
  else if (daysSinceUpdate < 180) scores.freshness = 60
  else if (daysSinceUpdate < 365) scores.freshness = 40
  else scores.freshness = 20

  // Format: Based on file types
  const preferredFormats = ['csv', 'json', 'geojson', 'parquet']
  const formatScores = files.map(f => {
    const format = f.format?.toLowerCase()
    if (preferredFormats.includes(format)) return 100
    if (['xlsx', 'xls'].includes(format)) return 70
    if (format === 'pdf') return 40
    return 50
  })
  scores.format = formatScores.length > 0
    ? Math.round(formatScores.reduce((a, b) => a + b, 0) / formatScores.length)
    : 50

  // Overall is weighted average
  scores.overall = Math.round(
    scores.completeness * 0.3 +
    scores.documentation * 0.25 +
    scores.freshness * 0.2 +
    scores.format * 0.25
  )

  return scores
}

// Parse CSV file to extract metadata
async function extractFileMetadata(fileBuffer, fileName) {
  const format = fileName.split('.').pop().toLowerCase()
  const metadata = {
    format: format.toUpperCase(),
    columns: [],
    previewData: [],
    rowCount: 0,
    columnCount: 0,
  }

  if (format === 'csv') {
    try {
      const content = fileBuffer.toString('utf-8')
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
      })

      if (records.length > 0) {
        const headers = Object.keys(records[0])
        metadata.columnCount = headers.length
        metadata.rowCount = records.length

        // Extract column info
        metadata.columns = headers.map(name => {
          const values = records.map(r => r[name]).filter(v => v !== '' && v != null)
          const uniqueValues = [...new Set(values)]
          
          // Detect type
          let type = 'string'
          if (values.length > 0) {
            const numericCount = values.filter(v => !isNaN(parseFloat(v))).length
            if (numericCount / values.length > 0.9) type = 'number'
            else if (values.some(v => /^\d{4}-\d{2}-\d{2}/.test(v))) type = 'date'
          }

          return {
            name,
            type,
            sampleValues: uniqueValues.slice(0, 5),
            nullCount: records.length - values.length,
            uniqueCount: uniqueValues.length,
          }
        })

        // Preview first 10 rows
        metadata.previewData = records.slice(0, 10).map(row => 
          headers.map(h => row[h])
        )
        metadata.previewData.unshift(headers) // Add header row
      }
    } catch (err) {
      console.error('CSV parse error:', err.message)
    }
  } else if (format === 'json') {
    try {
      const content = fileBuffer.toString('utf-8')
      const data = JSON.parse(content)
      const records = Array.isArray(data) ? data : [data]
      
      if (records.length > 0 && typeof records[0] === 'object') {
        const headers = Object.keys(records[0])
        metadata.columnCount = headers.length
        metadata.rowCount = records.length
        metadata.columns = headers.map(name => ({
          name,
          type: typeof records[0][name],
          sampleValues: [...new Set(records.slice(0, 5).map(r => String(r[name])))],
        }))
        metadata.previewData = [headers, ...records.slice(0, 10).map(row => 
          headers.map(h => row[h])
        )]
      }
    } catch (err) {
      console.error('JSON parse error:', err.message)
    }
  }

  return metadata
}

// List datasets with filters and pagination
export async function listDatasets(req, res, next) {
  try {
    const {
      category,
      license,
      format,
      country,
      uploader,
      organization,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query

    const query = { moderationStatus: 'approved', visibility: 'public' }
    
    // Allow uploader to see their own datasets
    if (uploader && req.user?._id?.toString() === uploader) {
      delete query.moderationStatus
      delete query.visibility
      query.uploader = uploader
    } else if (uploader) {
      query.uploader = uploader
    }

    if (category) query.category = category
    if (license) query.license = license
    if (format) query['files.format'] = { $regex: new RegExp(format, 'i') }
    if (country) query.geographicScope = country
    if (organization) query.organization = organization

    // Sorting
    let sortOption = { createdAt: -1 }
    if (sort === 'downloads') sortOption = { downloadCount: -1 }
    if (sort === 'likes') sortOption = { likeCount: -1 }
    if (sort === 'oldest') sortOption = { createdAt: 1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [datasets, total] = await Promise.all([
      Dataset.find(query)
        .select('-files.previewData -files.columns')
        .populate('uploader', 'name username avatar')
        .populate('organization', 'name slug logo')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Dataset.countDocuments(query),
    ])

    res.json({
      datasets,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    next(error)
  }
}

// Get single dataset by slug
export async function getDataset(req, res, next) {
  try {
    const { slug } = req.params

    const dataset = await Dataset.findOne({ slug })
      .populate('uploader', 'name username avatar')
      .populate('organization', 'name slug logo')
      .populate('moderatedBy', 'name')

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    // Check access
    if (dataset.visibility !== 'public' && dataset.moderationStatus !== 'approved') {
      if (!req.user) {
        throw new AppError('Access denied', 403)
      }
      const isOwner = dataset.uploader._id.toString() === req.user._id.toString()
      const isAdmin = req.user.role === 'admin'
      if (!isOwner && !isAdmin) {
        throw new AppError('Access denied', 403)
      }
    }

    // Check if user liked this dataset
    let likedByMe = false
    if (req.user) {
      const like = await DatasetLike.findOne({ dataset: dataset._id, user: req.user._id })
      likedByMe = !!like
    }

    // Increment view count
    await Dataset.updateOne({ _id: dataset._id }, { $inc: { viewCount: 1 } })

    res.json({ ...dataset.toObject(), likedByMe })
  } catch (error) {
    next(error)
  }
}

// Create dataset
export async function createDataset(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      license,
      visibility = 'public',
      source,
      temporalCoverage,
      methodology,
      tags,
    } = req.body

    let geographicScope = req.body['geographicScope[]'] || req.body.geographicScope
    if (typeof geographicScope === 'string') geographicScope = [geographicScope]

    let parsedTags = tags
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    // Process uploaded files
    const files = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileData = {
          name: file.originalname,
          originalName: file.originalname,
          url: file.path,
          publicId: file.filename,
          format: file.originalname.split('.').pop().toUpperCase(),
          size: file.size,
          mimeType: file.mimetype,
        }

        // Extract metadata for supported formats (if we have the buffer)
        // Note: With Cloudinary storage, we may not have direct buffer access
        // This would need adjustment based on actual file handling
        
        files.push(fileData)
      }
    }

    const dataset = new Dataset({
      title,
      description,
      category,
      license,
      visibility,
      source,
      temporalCoverage,
      methodology,
      tags: parsedTags,
      geographicScope: geographicScope || [],
      files,
      uploader: req.user._id,
      organization: req.user.organization,
    })

    // Calculate quality score
    dataset.qualityScore = calculateQualityScore(dataset, files)

    await dataset.save()

    // Create initial version
    await DatasetVersion.create({
      dataset: dataset._id,
      versionNumber: 1,
      changelog: 'Initial upload',
      files: files.map(f => ({
        name: f.name,
        url: f.url,
        publicId: f.publicId,
        format: f.format,
        size: f.size,
      })),
      createdBy: req.user._id,
    })

    const populated = await Dataset.findById(dataset._id)
      .populate('uploader', 'name username avatar')
      .populate('organization', 'name slug logo')

    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

// Update dataset
export async function updateDataset(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    // Check ownership
    const isOwner = dataset.uploader.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only edit your own datasets', 403)
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'license', 'visibility',
      'source', 'temporalCoverage', 'methodology', 'tags', 'geographicScope'
    ]

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        dataset[field] = req.body[field]
      }
    })

    // Recalculate quality score
    dataset.qualityScore = calculateQualityScore(dataset, dataset.files)

    await dataset.save()

    const populated = await Dataset.findById(dataset._id)
      .populate('uploader', 'name username avatar')
      .populate('organization', 'name slug logo')

    res.json(populated)
  } catch (error) {
    next(error)
  }
}

// Delete dataset
export async function deleteDataset(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const isOwner = dataset.uploader.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only delete your own datasets', 403)
    }

    // TODO: Delete files from Cloudinary

    await Dataset.deleteOne({ _id: dataset._id })
    await DatasetVersion.deleteMany({ dataset: dataset._id })
    await DatasetLike.deleteMany({ dataset: dataset._id })
    await Review.deleteMany({ dataset: dataset._id })

    res.json({ message: 'Dataset deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Like dataset
export async function likeDataset(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const existingLike = await DatasetLike.findOne({
      dataset: dataset._id,
      user: req.user._id,
    })

    if (existingLike) {
      throw new AppError('Already liked this dataset', 400)
    }

    await DatasetLike.create({
      dataset: dataset._id,
      user: req.user._id,
    })

    await Dataset.updateOne({ _id: dataset._id }, { $inc: { likeCount: 1 } })

    res.json({ message: 'Dataset liked', likeCount: dataset.likeCount + 1 })
  } catch (error) {
    next(error)
  }
}

// Unlike dataset
export async function unlikeDataset(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const like = await DatasetLike.findOneAndDelete({
      dataset: dataset._id,
      user: req.user._id,
    })

    if (!like) {
      throw new AppError('Not liked yet', 400)
    }

    await Dataset.updateOne({ _id: dataset._id }, { $inc: { likeCount: -1 } })

    res.json({ message: 'Like removed', likeCount: Math.max(0, dataset.likeCount - 1) })
  } catch (error) {
    next(error)
  }
}

// Download file
export async function downloadFile(req, res, next) {
  try {
    const { slug, fileId } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const file = dataset.files.id(fileId)
    if (!file) {
      throw new AppError('File not found', 404)
    }

    // Log download
    await DatasetDownload.create({
      dataset: dataset._id,
      file: fileId,
      user: req.user?._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    await Dataset.updateOne({ _id: dataset._id }, { $inc: { downloadCount: 1 } })

    res.json({ url: file.url, name: file.name })
  } catch (error) {
    next(error)
  }
}

// Get file preview
export async function getFilePreview(req, res, next) {
  try {
    const { slug, fileId } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const file = dataset.files.id(fileId)
    if (!file) {
      throw new AppError('File not found', 404)
    }

    res.json({
      name: file.name,
      format: file.format,
      size: file.size,
      rowCount: file.rowCount,
      columnCount: file.columnCount,
      columns: file.columns || [],
      previewData: file.previewData || [],
    })
  } catch (error) {
    next(error)
  }
}

// Get dataset versions
export async function getVersions(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const versions = await DatasetVersion.find({ dataset: dataset._id })
      .populate('createdBy', 'name username')
      .sort({ versionNumber: -1 })

    res.json({ versions })
  } catch (error) {
    next(error)
  }
}

// Get reviews
export async function getReviews(req, res, next) {
  try {
    const { slug } = req.params
    const dataset = await Dataset.findOne({ slug })

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const reviews = await Review.find({ dataset: dataset._id })
      .populate('user', 'name username avatar')
      .sort({ createdAt: -1 })

    // Calculate average
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

    res.json({ reviews, avgRating })
  } catch (error) {
    next(error)
  }
}

// Create review
export async function createReview(req, res, next) {
  try {
    const { slug } = req.params
    const { rating, comment } = req.body

    const dataset = await Dataset.findOne({ slug })
    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      dataset: dataset._id,
      user: req.user._id,
    })

    if (existingReview) {
      throw new AppError('You have already reviewed this dataset', 400)
    }

    const review = await Review.create({
      dataset: dataset._id,
      user: req.user._id,
      rating,
      comment,
    })

    const populated = await Review.findById(review._id)
      .populate('user', 'name username avatar')

    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

// Update review
export async function updateReview(req, res, next) {
  try {
    const { slug, reviewId } = req.params
    const { rating, comment } = req.body

    const dataset = await Dataset.findOne({ slug })
    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const review = await Review.findById(reviewId)
    if (!review) {
      throw new AppError('Review not found', 404)
    }

    if (review.user.toString() !== req.user._id.toString()) {
      throw new AppError('You can only edit your own reviews', 403)
    }

    if (rating !== undefined) review.rating = rating
    if (comment !== undefined) review.comment = comment

    await review.save()

    const populated = await Review.findById(review._id)
      .populate('user', 'name username avatar')

    res.json(populated)
  } catch (error) {
    next(error)
  }
}

// Delete review
export async function deleteReview(req, res, next) {
  try {
    const { slug, reviewId } = req.params

    const dataset = await Dataset.findOne({ slug })
    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const review = await Review.findById(reviewId)
    if (!review) {
      throw new AppError('Review not found', 404)
    }

    const isOwner = review.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only delete your own reviews', 403)
    }

    await Review.deleteOne({ _id: reviewId })

    res.json({ message: 'Review deleted' })
  } catch (error) {
    next(error)
  }
}
