import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { uploadProfileImage } from '../config/cloudinary.js'
import {
  getUser,
  updateProfile,
  updateAvatar,
  changePassword,
} from '../controllers/user.controller.js'

const router = Router()

router.get('/:username', getUser)
router.put('/profile', authenticate, updateProfile)
router.put('/avatar', authenticate, uploadProfileImage.single('avatar'), updateAvatar)
router.put('/password', authenticate, changePassword)

export default router
