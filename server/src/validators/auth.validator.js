/**
 * server/src/validators/auth.validator.js
 *
 * express-validator middleware chains for every auth route.
 * express-validator is already listed in package.json but was never used.
 *
 * Usage — attach before the controller in auth.routes.js:
 *
 *   import { validateSignUp, handleValidationErrors } from '../validators/auth.validator.js'
 *   router.post('/sign-up', validateSignUp, handleValidationErrors, signUp)
 *
 * handleValidationErrors must always be the last middleware before the controller.
 * It collects all failures accumulated by the chain and returns a 422 with details.
 */

import { body, validationResult } from 'express-validator'

// ─── Reusable field rules ─────────────────────────────────────────────────────

/** Password rules — shared by sign-up and reset-password */
const passwordRules = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')

/** Email field — shared across multiple routes */
const emailRule = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Enter a valid email address')
  .normalizeEmail()

// ─── Route validators ─────────────────────────────────────────────────────────

/**
 * POST /auth/sign-up
 */
export const validateSignUp = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, and underscores')
    .toLowerCase(),

  emailRule,

  passwordRules,

  body('role')
    .optional()
    .isIn(['researcher', 'contributor', 'institution'])
    .withMessage('Role must be one of: researcher, contributor, institution'),
]

/**
 * POST /auth/sign-in
 */
export const validateSignIn = [
  emailRule,

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]

/**
 * POST /auth/forgot-password
 */
export const validateForgotPassword = [
  emailRule,
]

/**
 * POST /auth/reset-password/:token
 */
export const validateResetPassword = [
  passwordRules,

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match')
      }
      return true
    }),
]

// ─── Error collector ──────────────────────────────────────────────────────────

/**
 * Final middleware in every validation chain.
 * Collects all accumulated errors and returns a structured 422 response.
 * If there are no errors, calls next() to continue to the controller.
 *
 * @type {import('express').RequestHandler}
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field:   err.path,
      message: err.msg,
    }))

    return res.status(422).json({
      error:  'Validation failed',
      errors: formatted,
    })
  }

  next()
}
