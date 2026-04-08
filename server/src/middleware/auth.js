import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { AppError } from './errorHandler.js'

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      throw new AppError('User not found', 401)
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    User.findById(decoded.userId).select('-password').then(user => {
      req.user = user
      next()
    }).catch(() => next())
  } catch {
    next()
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403))
    }
    next()
  }
}
