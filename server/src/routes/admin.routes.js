import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  getDashboardStats,
  getPendingDatasets,
  moderateDataset,
  listUsers,
  updateUserRole,
  featureDataset,
} from '../controllers/admin.controller.js'

const router = Router()

router.use(authenticate, requireRole('admin'))

router.get('/dashboard', getDashboardStats)
router.get('/datasets/pending', getPendingDatasets)
router.patch('/datasets/:slug/moderate', moderateDataset)
router.patch('/datasets/:slug/feature', featureDataset)
router.get('/users', listUsers)
router.patch('/users/:userId/role', updateUserRole)

export default router
