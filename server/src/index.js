import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'

// Route imports
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import datasetRoutes from './routes/dataset.routes.js'
import searchRoutes from './routes/search.routes.js'
import discussionRoutes from './routes/discussion.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import apiKeyRoutes from './routes/apiKey.routes.js'
import adminRoutes from './routes/admin.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/datasets', datasetRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/api-keys', apiKeyRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
