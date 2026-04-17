/**
 * server/src/utils/hash.utils.js
 *
 * bcryptjs password helpers and cryptographic token generation.
 *
 * The User model hashes passwords in a pre-save hook, which is the right
 * place for Mongoose-level safety. These utilities complement that by
 * providing explicit hashing for cases where we operate on the raw value
 * before it touches a model (e.g. in the auth service) and for generating
 * the secure random tokens used for email verification and password reset.
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ─── Config ───────────────────────────────────────────────────────────────────

/** Cost factor — matches the User model pre-save hook (bcrypt.hash cost 12) */
const BCRYPT_ROUNDS = 12

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password.
 *
 * Use when you need a hash outside of a Mongoose save operation —
 * e.g. when bulk-seeding users or testing. In normal app flow the
 * User model's pre('save') hook handles this automatically.
 *
 * @param {string} password  Plaintext password
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 *
 * Wraps bcrypt.compare so callers don't import bcryptjs directly.
 * The User model exposes comparePassword() as an instance method —
 * use that for model instances; use this for standalone comparisons.
 *
 * @param {string} plaintext  The password the user typed
 * @param {string} hash       The stored bcrypt hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash)
}

/**
 * Validate that a password meets the platform's strength rules.
 * Returns null if valid; returns an error message string if invalid.
 *
 * Rules match the frontend validator (validators.js):
 *   - At least 8 characters
 *   - At least one uppercase letter
 *   - At least one digit
 *
 * @param {string} password
 * @returns {string|null}
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

// ─── Secure tokens ────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random hex token.
 * Used for email verification and password reset tokens.
 *
 * @param {number} [bytes=32]  Number of random bytes (hex string will be 2× this length)
 * @returns {string}  64-character hex string by default
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Return the Date at which a token expires.
 *
 * @param {number} hours  Hours from now (default: 24)
 * @returns {Date}
 */
export function tokenExpiresAt(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

/**
 * Check whether a token expiry date is still in the future.
 *
 * @param {Date|string|number} expiresAt
 * @returns {boolean}
 */
export function isTokenValid(expiresAt) {
  if (!expiresAt) return false
  return new Date(expiresAt) > new Date()
}
