import mongoose from 'mongoose'

const datasetDownloadSchema = new mongoose.Schema({
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: String,
  userAgent: String,
  country: String,
}, {
  timestamps: true,
})

datasetDownloadSchema.index({ dataset: 1, createdAt: -1 })
datasetDownloadSchema.index({ user: 1 })

export const DatasetDownload = mongoose.model('DatasetDownload', datasetDownloadSchema)
