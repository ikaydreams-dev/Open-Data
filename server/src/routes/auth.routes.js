import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  signUp,
  signIn,
  signOut,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  resendVerification,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/sign-up', signUp)
router.post('/sign-in', signIn)
router.post('/sign-out', signOut)
router.post('/refresh', refresh)
router.get('/verify-email/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/me', authenticate, getMe)
router.post('/resend-verification', authenticate, resendVerification)

export default router
