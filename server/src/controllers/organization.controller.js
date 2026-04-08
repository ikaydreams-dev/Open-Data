import { Organization, Dataset, User } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

export async function listOrganizations(req, res, next) {
  try {
    const { type, page = 1, limit = 20 } = req.query
    const query = {}

    if (type) query.type = type

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [organizations, total] = await Promise.all([
      Organization.find(query)
        .sort({ datasetCount: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Organization.countDocuments(query),
    ])

    res.json({
      organizations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    next(error)
  }
}

export async function getOrganization(req, res, next) {
  try {
    const { slug } = req.params

    const organization = await Organization.findOne({ slug })
      .populate('members.user', 'name username avatar')

    if (!organization) {
      throw new AppError('Organization not found', 404)
    }

    const datasets = await Dataset.find({
      organization: organization._id,
      visibility: 'public',
      moderationStatus: 'approved',
    })
      .select('title slug category downloadCount likeCount createdAt')
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ organization, datasets })
  } catch (error) {
    next(error)
  }
}

export async function createOrganization(req, res, next) {
  try {
    const { name, description, type, website, location, country } = req.body

    const organization = await Organization.create({
      name,
      description,
      type,
      website,
      location,
      country,
      members: [{ user: req.user._id, role: 'owner' }],
    })

    // Update user's organization
    await User.findByIdAndUpdate(req.user._id, { organization: organization._id })

    res.status(201).json(organization)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganization(req, res, next) {
  try {
    const { slug } = req.params
    const organization = await Organization.findOne({ slug })

    if (!organization) {
      throw new AppError('Organization not found', 404)
    }

    // Check if user is owner or admin
    const membership = organization.members.find(m => m.user.toString() === req.user._id.toString())
    const isOrgAdmin = membership && ['owner', 'admin'].includes(membership.role)
    const isSuperAdmin = req.user.role === 'admin'

    if (!isOrgAdmin && !isSuperAdmin) {
      throw new AppError('Access denied', 403)
    }

    const allowedUpdates = ['name', 'description', 'type', 'website', 'location', 'country']
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        organization[field] = req.body[field]
      }
    })

    await organization.save()

    res.json(organization)
  } catch (error) {
    next(error)
  }
}
