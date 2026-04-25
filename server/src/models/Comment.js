import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    maxlength: 5000,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  replyCount: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

commentSchema.index({ discussion: 1, createdAt: 1 })
commentSchema.index({ parentComment: 1 })

export const Comment = mongoose.model('Comment', commentSchema)
