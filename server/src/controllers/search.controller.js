import { Dataset } from '../models/index.js'

export async function search(req, res, next) {
  try {
    const {
      q = '',
      category,
      license,
      format,
      country,
      page = 1,
      limit = 20,
    } = req.query

    const query = {
      moderationStatus: 'approved',
      visibility: 'public',
    }

    // Text search
    if (q) {
      query.$text = { $search: q }
    }

    if (category) query.category = category
    if (license) query.license = license
    if (format) query['files.format'] = { $regex: new RegExp(format, 'i') }
    if (country) query.geographicScope = country

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [datasets, total] = await Promise.all([
      Dataset.find(query)
        .select('-files.previewData -files.columns')
        .populate('uploader', 'name username avatar')
        .populate('organization', 'name slug logo')
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
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

export async function autocomplete(req, res, next) {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] })
    }

    const datasets = await Dataset.find({
      title: { $regex: q, $options: 'i' },
      moderationStatus: 'approved',
      visibility: 'public',
    })
      .select('title slug category')
      .limit(10)

    const suggestions = datasets.map(d => ({
      title: d.title,
      slug: d.slug,
      category: d.category,
    }))

    res.json({ suggestions })
  } catch (error) {
    next(error)
  }
}
