import { User, Dataset } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

export async function getUser(req, res, next) {
  try {
    const { username } = req.params

    const user = await User.findOne({ username })
      .select('-email')
      .populate('organization', 'name slug logo')

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Get user's public datasets
    const datasets = await Dataset.find({
      uploader: user._id,
      visibility: 'public',
      moderationStatus: 'approved',
    })
      .select('title slug category downloadCount likeCount createdAt')
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      user,
      datasets,
      stats: {
        datasetCount: await Dataset.countDocuments({ uploader: user._id, moderationStatus: 'approved' }),
        totalDownloads: datasets.reduce((sum, d) => sum + (d.downloadCount || 0), 0),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowedUpdates = ['name', 'bio', 'affiliation', 'location', 'website']
    const updates = {}

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('organization', 'name slug logo')

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('No image uploaded', 400)
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: req.file.path,
          publicId: req.file.filename,
        },
      },
      { new: true }
    )

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400)
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}
