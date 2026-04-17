/**
 * server/src/utils/jwt.utils.js
 *
 * All JWT operations in one place.
 * auth.controller.js had generateTokens() inlined — moved here so the
 * auth service, middleware, and any future API-key auth can all share
 * the same token logic without duplicating secrets or expiry config.
 */

import jwt from 'jsonwebtoken'
import { AppError } from '../middleware/errorHandler.js'

// ─── Config ───────────────────────────────────────────────────────────────────

const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET
const ACCESS_EXPIRES  = () => process.env.JWT_ACCESS_EXPIRES  || '15m'
const REFRESH_EXPIRES = () => process.env.JWT_REFRESH_EXPIRES || '7d'

/** Milliseconds until the refresh cookie expires (matches JWT_REFRESH_EXPIRES) */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── Token generation ─────────────────────────────────────────────────────────

/**
 * Generate a matched pair of access + refresh tokens for a user.
 *
 * @param {string|ObjectId} userId
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId: userId.toString() },
    ACCESS_SECRET(),
    { expiresIn: ACCESS_EXPIRES() },
  )

  const refreshToken = jwt.sign(
    { userId: userId.toString() },
    REFRESH_SECRET(),
    { expiresIn: REFRESH_EXPIRES() },
  )

  return { accessToken, refreshToken }
}

// ─── Token verification ───────────────────────────────────────────────────────

/**
 * Verify and decode an access token.
 * Throws AppError(401) on any failure so callers don't need to catch JsonWebTokenError.
 *
 * @param {string} token
 * @returns {{ userId: string }}
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET())
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401)
    }
    throw new AppError('Invalid access token', 401)
  }
}

/**
 * Verify and decode a refresh token.
 * Throws AppError(401) on any failure.
 *
 * @param {string} token
 * @returns {{ userId: string }}
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET())
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired — please sign in again', 401)
    }
    throw new AppError('Invalid refresh token', 401)
  }
}

/**
 * Decode a token without verifying the signature.
 * Safe to call on expired tokens for logging / debugging only.
 * Never use this to authorise requests.
 *
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch {
    return null
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Attach the refresh token to the response as an httpOnly cookie.
 *
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
export function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
  })
}

/**
 * Clear the refresh token cookie (used on sign-out).
 *
 * @param {import('express').Response} res
 */
export function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}
