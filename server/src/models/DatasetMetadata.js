import mongoose from 'mongoose'

const datasetMetadataSchema = new mongoose.Schema({
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    unique: true,
  },
  sourceUrl: String,
  methodology: String,
  collectionMethod: {
    type: String,
    enum: ['survey', 'satellite', 'administrative', 'sensor', 'scraped', 'other'],
  },
  updateFrequency: {
    type: String,
    enum: ['realtime', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'irregular', 'static'],
  },
  spatialResolution: String, // e.g. "1km", "district-level", "national"
  dataFormat: String,        // e.g. "tabular", "geospatial", "time-series"
  language: { type: String, default: 'en' },
  contactEmail: String,
  citationInfo: String,
  relatedDatasets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
  }],
}, {
  timestamps: true,
})

datasetMetadataSchema.index({ dataset: 1 })

export const DatasetMetadata = mongoose.model('DatasetMetadata', datasetMetadataSchema)
