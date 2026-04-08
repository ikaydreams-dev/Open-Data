import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 2000,
  },
}, {
  timestamps: true,
})

// One review per user per dataset
reviewSchema.index({ dataset: 1, user: 1 }, { unique: true })
reviewSchema.index({ dataset: 1, createdAt: -1 })

export const Review = mongoose.model('Review', reviewSchema)
