import { z } from 'zod'

const CATEGORIES = [
  'healthcare', 'agriculture', 'economics', 'education', 'climate',
  'transport', 'finance', 'governance', 'demographics', 'energy',
  'water', 'land', 'conflict', 'technology', 'trade', 'public-health',
  'biodiversity', 'housing', 'gender', 'labour', 'justice', 'media',
  'tourism', 'science', 'food', 'disaster', 'sports',
]

const LICENSES = ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'odc-by', 'odbl', 'proprietary']

const VISIBILITIES = ['public', 'private', 'organization']

export const createDatasetSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000).optional(),
  category: z.enum(CATEGORIES, { required_error: 'Category is required' }),
  license: z.enum(LICENSES, { required_error: 'License is required' }),
  visibility: z.enum(VISIBILITIES).default('public'),
  source: z.string().max(500).optional(),
  temporalCoverage: z.string().max(100).optional(),
  methodology: z.string().max(5000).optional(),
  tags: z
    .union([
      z.array(z.string().trim().toLowerCase()),
      z.string().transform((val) =>
        val.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      ),
    ])
    .optional()
    .default([]),
  geographicScope: z
    .union([z.array(z.string()), z.string().transform((val) => [val])])
    .optional()
    .default([]),
})

export const updateDatasetSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200)
    .optional(),
  description: z.string().max(5000).optional(),
  category: z.enum(CATEGORIES).optional(),
  license: z.enum(LICENSES).optional(),
  visibility: z.enum(VISIBILITIES).optional(),
  source: z.string().max(500).optional(),
  temporalCoverage: z.string().max(100).optional(),
  methodology: z.string().max(5000).optional(),
  tags: z
    .union([
      z.array(z.string().trim().toLowerCase()),
      z.string().transform((val) =>
        val.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      ),
    ])
    .optional(),
  geographicScope: z
    .union([z.array(z.string()), z.string().transform((val) => [val])])
    .optional(),
})

export const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required' })
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(2000).optional(),
})

export const moderateDatasetSchema = z.object({
  status: z.enum(['approved', 'rejected', 'under_review'], {
    required_error: 'Status is required',
  }),
  note: z.string().max(1000).optional(),
})
