import express from 'express';
import * as workspaceController from '../controllers/workspace.controller.js';
import { auth } from '../middleware/auth.js'; // Assuming this exists for JWT
import { validate } from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import { apiLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Validation Rules
const workspaceSchema = [
  body('name').trim().notEmpty().withMessage('Workspace name is required'),
  body('description').optional().isString(),
];

router.use(auth); // All workspace routes require authentication

router.route('/')
  .get(workspaceController.getWorkspaces)
  .post(apiLimiter, validate(workspaceSchema), workspaceController.createWorkspace);

router.route('/:id')
  .get(workspaceController.getWorkspaceById)
  .patch(validate(workspaceSchema), workspaceController.updateWorkspace)
  .delete(workspaceController.deleteWorkspace);

export default router;