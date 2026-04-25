import mongoose from 'mongoose'

export const datasetFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  publicId: String,
  format: { type: String, required: true },
  size: { type: Number, default: 0 },
  mimeType: String,
  rowCount: Number,
  columnCount: Number,
  columns: [{
    name: String,
    type: String,
    description: String,
    sampleValues: [String],
    nullCount: Number,
    uniqueCount: Number,
  }],
  previewData: [[mongoose.Schema.Types.Mixed]],
}, { _id: true })

// Standalone model for cases where files need to be queried independently
export const DatasetFile = mongoose.model('DatasetFile', datasetFileSchema)
