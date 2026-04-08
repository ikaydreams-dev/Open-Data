import { ApiKey } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

export async function listApiKeys(req, res, next) {
  try {
    const apiKeys = await ApiKey.find({ user: req.user._id })
      .select('-key')
      .sort({ createdAt: -1 })

    res.json({ apiKeys })
  } catch (error) {
    next(error)
  }
}

export async function createApiKey(req, res, next) {
  try {
    const { name, permissions, expiresAt } = req.body

    const apiKey = await ApiKey.create({
      user: req.user._id,
      name,
      permissions: permissions || ['read:datasets', 'search'],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    // Return full key only on creation
    res.status(201).json({
      apiKey: {
        ...apiKey.toObject(),
        key: apiKey.key, // Full key shown only once
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteApiKey(req, res, next) {
  try {
    const { id } = req.params

    const apiKey = await ApiKey.findOne({ _id: id, user: req.user._id })
    if (!apiKey) {
      throw new AppError('API key not found', 404)
    }

    await ApiKey.deleteOne({ _id: id })

    res.json({ message: 'API key deleted' })
  } catch (error) {
    next(error)
  }
}

export async function toggleApiKey(req, res, next) {
  try {
    const { id } = req.params

    const apiKey = await ApiKey.findOne({ _id: id, user: req.user._id })
    if (!apiKey) {
      throw new AppError('API key not found', 404)
    }

    apiKey.isActive = !apiKey.isActive
    await apiKey.save()

    res.json({ apiKey, message: apiKey.isActive ? 'API key activated' : 'API key deactivated' })
  } catch (error) {
    next(error)
  }
}
