import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
} from '../controllers/organization.controller.js'

const router = Router()

router.get('/', listOrganizations)
router.get('/:slug', getOrganization)
router.post('/', authenticate, createOrganization)
router.put('/:slug', authenticate, updateOrganization)

export default router
