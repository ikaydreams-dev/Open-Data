import mongoose from 'mongoose'
import slugify from 'slugify'

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  type: {
    type: String,
    enum: ['university', 'government', 'ngo', 'company', 'research_institute', 'other'],
    default: 'other',
  },
  logo: {
    url: String,
    publicId: String,
  },
  website: String,
  location: String,
  country: String,
  verified: {
    type: Boolean,
    default: false,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  datasetCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

organizationSchema.pre('save', async function(next) {
  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1
    
    while (await mongoose.model('Organization').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    this.slug = slug
  }
  next()
})

export const Organization = mongoose.model('Organization', organizationSchema)
