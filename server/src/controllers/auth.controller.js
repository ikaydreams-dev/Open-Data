import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { AppError } from '../middleware/errorHandler.js'

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  )
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  )
  return { accessToken, refreshToken }
}

export async function signUp(req, res, next) {
  try {
    const { name, username, email, password, role } = req.body

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })
    if (existingUser) {
      throw new AppError(
        existingUser.email === email ? 'Email already registered' : 'Username taken',
        400
      )
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const user = await User.create({
      name,
      username,
      email,
      password,
      role: role || 'researcher',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    // TODO: Send verification email

    const { accessToken, refreshToken } = generateTokens(user._id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401)
    }

    user.lastLogin = new Date()
    await user.save()

    const { accessToken, refreshToken } = generateTokens(user._id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: user.toJSON(),
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function signOut(req, res, next) {
  try {
    res.clearCookie('refreshToken')
    res.json({ message: 'Signed out successfully' })
  } catch (error) {
    next(error)
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies
    if (!refreshToken) {
      throw new AppError('No refresh token', 401)
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) {
      throw new AppError('User not found', 401)
    }

    const tokens = generateTokens(user._id)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400)
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If that email exists, we sent a reset link' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = resetToken
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    // TODO: Send password reset email

    res.json({ message: 'If that email exists, we sent a reset link' })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getMe(req, res, next) {
  try {
    res.json(req.user)
  } catch (error) {
    next(error)
  }
}

export async function resendVerification(req, res, next) {
  try {
    const user = req.user
    if (user.emailVerified) {
      throw new AppError('Email already verified', 400)
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    // TODO: Send verification email

    res.json({ message: 'Verification email sent' })
  } catch (error) {
    next(error)
  }
}
