import mongoose from 'mongoose'
import slugify from 'slugify'

const datasetFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  publicId: String,
  format: { type: String, required: true },
  size: { type: Number, default: 0 },
  mimeType: String,
  rowCount: Number,
  columnCount: Number,
  columns: [{
    name: String,
    type: String,
    description: String,
    sampleValues: [String],
    nullCount: Number,
    uniqueCount: Number,
  }],
  previewData: [[mongoose.Schema.Types.Mixed]], // First 10 rows for preview
}, { _id: true })

const datasetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: 5000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'healthcare', 'agriculture', 'economics', 'education', 'climate',
      'transport', 'finance', 'governance', 'demographics', 'energy',
      'water', 'land', 'conflict', 'technology', 'trade', 'public-health',
      'biodiversity', 'housing', 'gender', 'labour', 'justice', 'media',
      'tourism', 'science', 'food', 'disaster', 'sports',
    ],
  },
  license: {
    type: String,
    required: [true, 'License is required'],
    enum: ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'odc-by', 'odbl', 'proprietary'],
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'organization'],
    default: 'public',
  },
  files: [datasetFileSchema],
  tags: [{ type: String, trim: true, lowercase: true }],
  geographicScope: [{ type: String }], // Countries
  temporalCoverage: String, // e.g., "2010-2023"
  source: String, // e.g., "National Bureau of Statistics"
  methodology: String,
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  moderationStatus: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted',
  },
  moderationNote: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: Date,
  qualityScore: {
    overall: { type: Number, min: 0, max: 100, default: 0 },
    completeness: { type: Number, min: 0, max: 100, default: 0 },
    documentation: { type: Number, min: 0, max: 100, default: 0 },
    freshness: { type: Number, min: 0, max: 100, default: 0 },
    format: { type: Number, min: 0, max: 100, default: 0 },
  },
  likeCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  currentVersion: { type: Number, default: 1 },
  featured: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Generate slug before saving
datasetSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1
    
    while (await mongoose.model('Dataset').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    this.slug = slug
  }
  next()
})

// Virtual for file count
datasetSchema.virtual('fileCount').get(function() {
  return this.files?.length ?? 0
})

// Indexes
datasetSchema.index({ title: 'text', description: 'text', tags: 'text' })
datasetSchema.index({ category: 1, moderationStatus: 1 })
datasetSchema.index({ uploader: 1 })
datasetSchema.index({ organization: 1 })
datasetSchema.index({ createdAt: -1 })
datasetSchema.index({ downloadCount: -1 })
datasetSchema.index({ likeCount: -1 })

export const Dataset = mongoose.model('Dataset', datasetSchema)
