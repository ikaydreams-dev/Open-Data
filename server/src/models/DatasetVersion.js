import mongoose from 'mongoose'

const datasetVersionSchema = new mongoose.Schema({
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  changelog: {
    type: String,
    maxlength: 2000,
  },
  files: [{
    name: String,
    url: String,
    publicId: String,
    format: String,
    size: Number,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

datasetVersionSchema.index({ dataset: 1, versionNumber: -1 })

export const DatasetVersion = mongoose.model('DatasetVersion', datasetVersionSchema)
