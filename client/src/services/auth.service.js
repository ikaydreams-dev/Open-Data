/**
 * server/src/services/auth.service.js
 *
 * Authentication business logic — extracted from auth.controller.js.
 *
 * The controller's job is to handle HTTP (parse req, call service, send res).
 * The service's job is to enforce business rules and talk to the database.
 * Splitting them makes each unit testable in isolation.
 *
 * All functions throw AppError on failure so the controller just needs
 * try/catch + next(error).
 */

import { User } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  generateTokens,
  verifyRefreshToken,
} from '../utils/jwt.utils.js'
import {
  generateSecureToken,
  tokenExpiresAt,
  validatePasswordStrength,
} from '../utils/hash.utils.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from './email.service.js'

// ─── Sign up ──────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * @param {{ name, username, email, password, role? }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function signUp({ name, username, email, password, role }) {
  // Duplicate check — one query covers both fields
  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) {
    const field = existing.email === email ? 'Email' : 'Username'
    throw new AppError(`${field} already registered`, 400)
  }

  // Validate password strength before creating the user
  const pwError = validatePasswordStrength(password)
  if (pwError) throw new AppError(pwError, 400)

  const verificationToken   = generateSecureToken()
  const verificationExpires = tokenExpiresAt(24) // 24 hours

  const user = await User.create({
    name,
    username,
    email,
    password,             // hashed by the User pre('save') hook
    role:                  role || 'researcher',
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  })

  // Fire-and-forget — don't fail sign-up if email delivery fails
  sendVerificationEmail({ name: user.name, email: user.email, token: verificationToken })
    .catch((err) => console.error('Verification email failed:', err.message))

  const { accessToken, refreshToken } = generateTokens(user._id)

  return { user: user.toJSON(), accessToken, refreshToken }
}

// ─── Sign in ──────────────────────────────────────────────────────────────────

/**
 * Authenticate an existing user with email + password.
 *
 * @param {{ email, password }} credentials
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function signIn({ email, password }) {
  const user = await User.findOne({ email }).select('+password')

  // Use a generic message — don't reveal which field is wrong
  if (!user) throw new AppError('Invalid email or password', 401)

  const isMatch = await user.comparePassword(password)
  if (!isMatch) throw new AppError('Invalid email or password', 401)

  // Persist last login without blocking the response
  User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {})

  const { accessToken, refreshToken } = generateTokens(user._id)

  return { user: user.toJSON(), accessToken, refreshToken }
}

// ─── Refresh token ────────────────────────────────────────────────────────────

/**
 * Issue a new token pair from a valid refresh token.
 *
 * @param {string} refreshToken
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function refreshTokens(refreshToken) {
  if (!refreshToken) throw new AppError('No refresh token provided', 401)

  const decoded = verifyRefreshToken(refreshToken) // throws on invalid/expired
  const user    = await User.findById(decoded.userId)

  if (!user) throw new AppError('User not found', 401)

  const tokens = generateTokens(user._id)

  return { user: user.toJSON(), ...tokens }
}

// ─── Email verification ───────────────────────────────────────────────────────

/**
 * Mark a user's email as verified using the token from the link.
 *
 * @param {string} token
 * @returns {{ message: string }}
 */
export async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken:   token,
    emailVerificationExpires: { $gt: Date.now() },
  })

  if (!user) throw new AppError('Invalid or expired verification token', 400)

  user.emailVerified            = true
  user.emailVerificationToken   = undefined
  user.emailVerificationExpires = undefined
  await user.save()

  // Welcome email after first-time verification
  sendWelcomeEmail({ name: user.name, email: user.email })
    .catch((err) => console.error('Welcome email failed:', err.message))

  return { message: 'Email verified successfully' }
}

/**
 * Re-send the verification email to the authenticated user.
 *
 * @param {object} user  The req.user object (from authenticate middleware)
 */
export async function resendVerification(user) {
  if (user.emailVerified) throw new AppError('Email already verified', 400)

  const token   = generateSecureToken()
  const expires = tokenExpiresAt(24)

  await User.findByIdAndUpdate(user._id, {
    emailVerificationToken:   token,
    emailVerificationExpires: expires,
  })

  await sendVerificationEmail({ name: user.name, email: user.email, token })

  return { message: 'Verification email sent' }
}

// ─── Password reset ───────────────────────────────────────────────────────────

/**
 * Generate a password reset token and email it to the user.
 * Uses a deliberately ambiguous response to avoid user enumeration.
 *
 * @param {string} email
 */
export async function forgotPassword(email) {
  const SAFE_RESPONSE = { message: 'If that email is registered, we sent a reset link.' }

  const user = await User.findOne({ email })
  if (!user) return SAFE_RESPONSE  // Don't reveal if the account exists

  const token   = generateSecureToken()
  const expires = tokenExpiresAt(1) // 1 hour

  user.passwordResetToken   = token
  user.passwordResetExpires = expires
  await user.save()

  sendPasswordResetEmail({ name: user.name, email: user.email, token })
    .catch((err) => console.error('Password reset email failed:', err.message))

  return SAFE_RESPONSE
}

/**
 * Set a new password using a valid reset token.
 *
 * @param {{ token: string, password: string }}
 * @returns {{ message: string }}
 */
export async function resetPassword({ token, password }) {
  const user = await User.findOne({
    passwordResetToken:   token,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) throw new AppError('Invalid or expired reset token', 400)

  const pwError = validatePasswordStrength(password)
  if (pwError) throw new AppError(pwError, 400)

  user.password             = password  // hashed by pre('save')
  user.passwordResetToken   = undefined
  user.passwordResetExpires = undefined
  await user.save()

  return { message: 'Password reset successfully' }
}
