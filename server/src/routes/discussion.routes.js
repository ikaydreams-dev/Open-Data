import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  listDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/discussion.controller.js'

const router = Router()

// Public routes
router.get('/', listDiscussions)
router.get('/:id', getDiscussion)
router.get('/:id/comments', getComments)

// Protected routes
router.post('/', authenticate, createDiscussion)
router.put('/:id', authenticate, updateDiscussion)
router.delete('/:id', authenticate, deleteDiscussion)

// Comments
router.post('/:id/comments', authenticate, createComment)
router.put('/:id/comments/:commentId', authenticate, updateComment)
router.delete('/:id/comments/:commentId', authenticate, deleteComment)

export default router
