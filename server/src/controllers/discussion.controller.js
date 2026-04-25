import { Discussion, Comment, Dataset } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

// List discussions
export async function listDiscussions(req, res, next) {
  try {
    const { dataset, user, page = 1, limit = 20 } = req.query
    const query = {}

    if (dataset) {
      const ds = await Dataset.findOne({ slug: dataset })
      if (ds) query.dataset = ds._id
    }
    if (user) query.user = user

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [discussions, total] = await Promise.all([
      Discussion.find(query)
        .populate('user', 'name username avatar')
        .populate('dataset', 'title slug')
        .sort({ isPinned: -1, lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Discussion.countDocuments(query),
    ])

    res.json({
      discussions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    next(error)
  }
}

// Get single discussion
export async function getDiscussion(req, res, next) {
  try {
    const { id } = req.params

    const discussion = await Discussion.findById(id)
      .populate('user', 'name username avatar')
      .populate('dataset', 'title slug')

    if (!discussion) {
      throw new AppError('Discussion not found', 404)
    }

    res.json(discussion)
  } catch (error) {
    next(error)
  }
}

// Create discussion
export async function createDiscussion(req, res, next) {
  try {
    const { dataset: datasetSlug, title, body } = req.body

    const dataset = await Dataset.findOne({ slug: datasetSlug })
    if (!dataset) {
      throw new AppError('Dataset not found', 404)
    }

    const discussion = await Discussion.create({
      dataset: dataset._id,
      user: req.user._id,
      title,
      body,
    })

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name username avatar')
      .populate('dataset', 'title slug')

    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

// Update discussion
export async function updateDiscussion(req, res, next) {
  try {
    const { id } = req.params
    const { title, body } = req.body

    const discussion = await Discussion.findById(id)
    if (!discussion) {
      throw new AppError('Discussion not found', 404)
    }

    const isOwner = discussion.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only edit your own discussions', 403)
    }

    if (title !== undefined) discussion.title = title
    if (body !== undefined) discussion.body = body

    await discussion.save()

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name username avatar')

    res.json(populated)
  } catch (error) {
    next(error)
  }
}

// Delete discussion
export async function deleteDiscussion(req, res, next) {
  try {
    const { id } = req.params

    const discussion = await Discussion.findById(id)
    if (!discussion) {
      throw new AppError('Discussion not found', 404)
    }

    const isOwner = discussion.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only delete your own discussions', 403)
    }

    await Comment.deleteMany({ discussion: id })
    await Discussion.deleteOne({ _id: id })

    res.json({ message: 'Discussion deleted' })
  } catch (error) {
    next(error)
  }
}

// Get comments for a discussion
export async function getComments(req, res, next) {
  try {
    const { id } = req.params

    const discussion = await Discussion.findById(id)
    if (!discussion) {
      throw new AppError('Discussion not found', 404)
    }

    const comments = await Comment.find({ discussion: id, parentComment: null })
      .populate('user', 'name username avatar')
      .sort({ createdAt: 1 })

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'name username avatar')
          .sort({ createdAt: 1 })
        return {
          ...comment.toObject(),
          replies,
        }
      })
    )

    res.json({ comments: commentsWithReplies })
  } catch (error) {
    next(error)
  }
}

// Create comment
export async function createComment(req, res, next) {
  try {
    const { id } = req.params
    const { body, parentComment } = req.body

    const discussion = await Discussion.findById(id)
    if (!discussion) {
      throw new AppError('Discussion not found', 404)
    }

    if (discussion.isLocked) {
      throw new AppError('This discussion is locked', 400)
    }

    // If replying to a comment, verify it exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment)
      if (!parent || parent.discussion.toString() !== id) {
        throw new AppError('Parent comment not found', 404)
      }
      await Comment.updateOne({ _id: parentComment }, { $inc: { replyCount: 1 } })
    }

    const comment = await Comment.create({
      discussion: id,
      user: req.user._id,
      body,
      parentComment,
    })

    // Update discussion
    await Discussion.updateOne(
      { _id: id },
      {
        $inc: { commentCount: 1 },
        lastActivity: new Date(),
      }
    )

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name username avatar')

    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

// Update comment
export async function updateComment(req, res, next) {
  try {
    const { commentId } = req.params
    const { body } = req.body

    const comment = await Comment.findById(commentId)
    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      throw new AppError('You can only edit your own comments', 403)
    }

    comment.body = body
    comment.isEdited = true
    await comment.save()

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name username avatar')

    res.json(populated)
  } catch (error) {
    next(error)
  }
}

// Delete comment
export async function deleteComment(req, res, next) {
  try {
    const { id, commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    const isOwner = comment.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      throw new AppError('You can only delete your own comments', 403)
    }

    // Delete replies if this is a parent comment
    if (!comment.parentComment) {
      const replyCount = await Comment.countDocuments({ parentComment: commentId })
      await Comment.deleteMany({ parentComment: commentId })
      await Discussion.updateOne(
        { _id: id },
        { $inc: { commentCount: -(replyCount + 1) } }
      )
    } else {
      await Comment.updateOne(
        { _id: comment.parentComment },
        { $inc: { replyCount: -1 } }
      )
      await Discussion.updateOne(
        { _id: id },
        { $inc: { commentCount: -1 } }
      )
    }

    await Comment.deleteOne({ _id: commentId })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    next(error)
  }
}
