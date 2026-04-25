/**
 * server/src/utils/apiKey.utils.js
 *
 * API key utilities: generation, validation, permission checks, and the
 * per-key rate limiter that the ApiKey model defines but nothing enforces yet.
 *
 * The ApiKey model stores:
 *   key         — full value (only shown once at creation)
 *   keyPrefix   — first 12 chars + '...' for safe display
 *   permissions — ['read:datasets', 'download:datasets', 'search']
 *   rateLimit   — { windowMs, maxRequests }
 *   expiresAt   — optional expiry date
 *   isActive    — soft disable without deleting
 */

import { v4 as uuidv4 } from 'uuid'
import { ApiKey } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

// ─── Key generation ───────────────────────────────────────────────────────────

/** All valid permissions, mirroring the ApiKey model enum */
export const VALID_PERMISSIONS = ['read:datasets', 'download:datasets', 'search']

/** Default permissions assigned when none are specified */
export const DEFAULT_PERMISSIONS = ['read:datasets', 'search']

/**
 * Generate a new API key string in the platform format: `odk_<32hex>`.
 * Matches the default() in the ApiKey model schema.
 *
 * @returns {string}  e.g. 'odk_a3f1c2d4e5b6...'
 */
export function generateApiKeyString() {
  return `odk_${uuidv4().replace(/-/g, '')}`
}

/**
 * Build the display prefix stored in ApiKey.keyPrefix.
 * Shows the first 12 characters + '…' so users can recognise their keys
 * without exposing the full secret.
 *
 * @param {string} key
 * @returns {string}  e.g. 'odk_a3f1c2d4...'
 */
export function buildKeyPrefix(key) {
  return key.slice(0, 12) + '...'
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Look up an API key from the Authorization header or `x-api-key` header.
 * Validates that it exists, is active, and has not expired.
 *
 * Returns the populated ApiKey document on success.
 * Throws AppError on any failure.
 *
 * @param {import('express').Request} req
 * @returns {Promise<import('mongoose').Document>}  The ApiKey document
 */
export async function resolveApiKey(req) {
  // Accept key from: Authorization: Bearer odk_xxx  OR  X-API-Key: odk_xxx
  let rawKey = null

  const authHeader = req.headers['authorization']
  if (authHeader?.startsWith('Bearer odk_')) {
    rawKey = authHeader.split(' ')[1]
  }

  if (!rawKey) {
    rawKey = req.headers['x-api-key'] ?? null
  }

  if (!rawKey) {
    throw new AppError('API key required', 401)
  }

  const apiKey = await ApiKey.findOne({ key: rawKey }).populate('user', '-password')

  if (!apiKey) {
    throw new AppError('Invalid API key', 401)
  }

  if (!apiKey.isActive) {
    throw new AppError('API key is disabled', 403)
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    throw new AppError('API key has expired', 403)
  }

  return apiKey
}

/**
 * Check that an API key has a required permission.
 * Throws AppError(403) if the permission is missing.
 *
 * @param {import('mongoose').Document} apiKey  The ApiKey document
 * @param {string} permission  One of VALID_PERMISSIONS
 */
export function requireKeyPermission(apiKey, permission) {
  if (!apiKey.permissions.includes(permission)) {
    throw new AppError(
      `API key does not have the '${permission}' permission`,
      403,
    )
  }
}

/**
 * Validate a permissions array provided by the user at key creation.
 * Filters out any values not in VALID_PERMISSIONS.
 *
 * @param {string[]} permissions
 * @returns {string[]}  Sanitised permissions array
 */
export function sanitisePermissions(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return DEFAULT_PERMISSIONS
  }
  const valid = permissions.filter((p) => VALID_PERMISSIONS.includes(p))
  return valid.length > 0 ? valid : DEFAULT_PERMISSIONS
}

// ─── Usage tracking ───────────────────────────────────────────────────────────

/**
 * Record that an API key was just used.
 * Updates lastUsed and increments usageCount without awaiting (fire-and-forget)
 * to keep request latency unaffected.
 *
 * @param {import('mongoose').Document} apiKey
 */
export function trackApiKeyUsage(apiKey) {
  ApiKey.updateOne(
    { _id: apiKey._id },
    { $set: { lastUsed: new Date() }, $inc: { usageCount: 1 } },
  ).catch(() => {
    // Non-fatal — don't fail the request if usage tracking fails
  })
}

// ─── Per-key rate limiter ─────────────────────────────────────────────────────

/**
 * In-memory store for per-key rate limit windows.
 * Good enough for single-instance deployments.
 * For multi-instance: replace with a Redis-backed store.
 *
 * Structure: Map<keyId, { count: number, windowStart: number }>
 */
const rateLimitStore = new Map()

/**
 * Check whether an API key has exceeded its configured rate limit.
 * Throws AppError(429) if the limit is exceeded.
 *
 * Uses a fixed-window algorithm: count is reset at the start of each window.
 *
 * @param {import('mongoose').Document} apiKey  The ApiKey document with rateLimit fields
 */
export function checkRateLimit(apiKey) {
  const { windowMs, maxRequests } = apiKey.rateLimit ?? { windowMs: 60_000, maxRequests: 100 }
  const keyId    = apiKey._id.toString()
  const now      = Date.now()
  const existing = rateLimitStore.get(keyId)

  if (!existing || now - existing.windowStart >= windowMs) {
    // First request in this window
    rateLimitStore.set(keyId, { count: 1, windowStart: now })
    return
  }

  existing.count++

  if (existing.count > maxRequests) {
    const retryAfterSecs = Math.ceil((existing.windowStart + windowMs - now) / 1000)
    throw new AppError(
      `Rate limit exceeded. Try again in ${retryAfterSecs} second${retryAfterSecs === 1 ? '' : 's'}.`,
      429,
    )
  }
}

/**
 * Express middleware that authenticates a request using an API key and
 * enforces the key's rate limit. Attaches `req.apiKey` and `req.user`
 * so downstream handlers work identically regardless of auth method.
 *
 * Usage:
 *   router.get('/datasets', apiKeyAuth('read:datasets'), listDatasets)
 *
 * @param {string} [requiredPermission]  If supplied, also checks this permission.
 */
export function apiKeyAuth(requiredPermission) {
  return async (req, res, next) => {
    try {
      const apiKey = await resolveApiKey(req)

      checkRateLimit(apiKey)

      if (requiredPermission) {
        requireKeyPermission(apiKey, requiredPermission)
      }

      trackApiKeyUsage(apiKey)

      req.apiKey = apiKey
      req.user   = apiKey.user   // Downstream code can use req.user as normal

      next()
    } catch (err) {
      next(err)
    }
  }
}
