import mongoose from 'mongoose'

const discussionSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  body: {
    type: String,
    maxlength: 5000,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

discussionSchema.index({ dataset: 1, lastActivity: -1 })
discussionSchema.index({ user: 1 })

export const Discussion = mongoose.model('Discussion', discussionSchema)
