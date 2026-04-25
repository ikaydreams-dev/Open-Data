import mongoose from 'mongoose'

const datasetTagSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
})

datasetTagSchema.index({ usageCount: -1 })
datasetTagSchema.index({ slug: 'text', label: 'text' })

export const DatasetTag = mongoose.model('DatasetTag', datasetTagSchema)
