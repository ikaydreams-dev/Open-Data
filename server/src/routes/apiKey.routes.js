import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
  toggleApiKey,
} from '../controllers/apiKey.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', listApiKeys)
router.post('/', createApiKey)
router.delete('/:id', deleteApiKey)
router.patch('/:id/toggle', toggleApiKey)

export default router
