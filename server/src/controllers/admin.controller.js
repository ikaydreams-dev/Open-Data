import { User, Dataset, Organization, Review } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalDatasets,
      pendingDatasets,
      totalOrganizations,
      recentDatasets,
    ] = await Promise.all([
      User.countDocuments(),
      Dataset.countDocuments(),
      Dataset.countDocuments({ moderationStatus: { $in: ['submitted', 'under_review'] } }),
      Organization.countDocuments(),
      Dataset.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title slug category moderationStatus createdAt')
        .populate('uploader', 'name'),
    ])

    res.json({
      stats: {
        totalUsers,
        totalDatasets,
        pendingDatasets,
        totalOrganizations,
      },
      recentDatasets,
    })
  } catch (error) {
    next(error)
  }
}

export async function getPendingDatasets(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [datasets, total] = await Promise.all([
      Dataset.find({ moderationStatus: { $in: ['submitted', 'under_review'] } })
        .populate('uploader', 'name username email')
        .populate('organization', 'name slug')
        .sort({ createdAt: 1 }) // Oldest first
        .skip(skip)
        .limit(parseInt(limit)),
      Dataset.countDocuments({ moderationStatus: { $in: ['submitted', 'under_review'] } }),
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

export async function moderateDataset(req, res, next) {
  try {
    const { slug } = req.params
    const { status, note } = req.body

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      throw new AppError('Invalid moderation status', 400)
    }

    const dataset = await Dataset.findOne({ slug })
    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    dataset.moderationStatus = status
    dataset.moderationNote = note
    dataset.moderatedBy = req.user._id
    dataset.moderatedAt = new Date()

    await dataset.save()

    res.json({ message: `Dataset ${status}`, dataset })
  } catch (error) {
    next(error)
  }
}

export async function listUsers(req, res, next) {
  try {
    const { role, page = 1, limit = 20 } = req.query
    const query = {}
    if (role) query.role = role

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ])

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    next(error)
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['admin', 'researcher', 'contributor', 'institution'].includes(role)) {
      throw new AppError('Invalid role', 400)
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function featureDataset(req, res, next) {
  try {
    const { slug } = req.params
    const { featured } = req.body

    const dataset = await Dataset.findOneAndUpdate(
      { slug },
      { featured: !!featured },
      { new: true }
    )

    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    res.json({ message: featured ? 'Dataset featured' : 'Dataset unfeatured', dataset })
  } catch (error) {
    next(error)
  }
}
