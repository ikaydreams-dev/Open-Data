import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'researcher', 'contributor', 'institution'],
    default: 'researcher',
  },
  avatar: {
    url: String,
    publicId: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  affiliation: String,
  location: String,
  website: String,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
}, {
  timestamps: true,
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.emailVerificationToken
  delete obj.emailVerificationExpires
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  return obj
}

export const User = mongoose.model('User', userSchema)
