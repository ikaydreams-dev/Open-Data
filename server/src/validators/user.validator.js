/**
 * server/src/validators/user.validator.js
 *
 * express-validator middleware chains for user routes:
 *   PUT /users/profile   — updateProfile
 *   PUT /users/password  — changePassword
 *
 * Re-exports handleValidationErrors from auth.validator.js so routes
 * only need one import for both the chain and the collector.
 *
 * Usage:
 *   import { validateUpdateProfile, handleValidationErrors } from '../validators/user.validator.js'
 *   router.put('/profile', authenticate, validateUpdateProfile, handleValidationErrors, updateProfile)
 */

import { body } from 'express-validator'

// Re-export so callers get everything from one place
export { handleValidationErrors } from './auth.validator.js'

// ─── PUT /users/profile ───────────────────────────────────────────────────────

/**
 * All fields are optional on a profile update — the controller applies
 * only the fields that are actually present in the request body.
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be at most 500 characters'),

  body('affiliation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Affiliation must be at most 200 characters'),

  body('location')
    .optional()
    .trim()
    // Accept any African country name or a free-form string
    .isLength({ max: 100 })
    .withMessage('Location must be at most 100 characters'),

  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: true, protocols: ['http', 'https'] })
    .withMessage('Website must be a valid URL starting with http(s)://'),
]

// ─── PUT /users/password ──────────────────────────────────────────────────────

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match')
      }
      return true
    }),
]

// ─── POST /api-keys ───────────────────────────────────────────────────────────

/** Validation for API key creation, co-located here since it's user-scoped */
export const validateCreateApiKey = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('API key name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((perms) => {
      const valid = ['read:datasets', 'download:datasets', 'search']
      const invalid = perms.filter((p) => !valid.includes(p))
      if (invalid.length > 0) {
        throw new Error(`Invalid permissions: ${invalid.join(', ')}`)
      }
      return true
    }),

  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('expiresAt must be a future date')
      }
      return true
    }),
]
