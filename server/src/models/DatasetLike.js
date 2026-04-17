import mongoose from 'mongoose'

const datasetLikeSchema = new mongoose.Schema({
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

datasetLikeSchema.index({ dataset: 1, user: 1 }, { unique: true })

export const DatasetLike = mongoose.model('DatasetLike', datasetLikeSchema)
