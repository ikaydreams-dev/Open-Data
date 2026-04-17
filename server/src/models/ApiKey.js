import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: 100,
  },
  key: {
    type: String,
    unique: true,
    default: () => `odk_${uuidv4().replace(/-/g, '')}`,
  },
  keyPrefix: {
    type: String,
  },
  lastUsed: Date,
  usageCount: {
    type: Number,
    default: 0,
  },
  rateLimit: {
    windowMs: { type: Number, default: 60000 }, // 1 minute
    maxRequests: { type: Number, default: 100 },
  },
  permissions: [{
    type: String,
    enum: ['read:datasets', 'download:datasets', 'search'],
  }],
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Store only prefix after creation for display
apiKeySchema.pre('save', function(next) {
  if (this.isNew) {
    this.keyPrefix = this.key.slice(0, 12) + '...'
  }
  next()
})

apiKeySchema.index({ user: 1 })
apiKeySchema.index({ key: 1 })

export const ApiKey = mongoose.model('ApiKey', apiKeySchema)
