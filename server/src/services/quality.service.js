/**
 * Calculates a multi-dimensional quality score for a dataset.
 *
 * Weights:
 *   completeness  30%
 *   documentation 25%
 *   freshness     20%
 *   format        25%
 */
export function calculateQualityScore(dataset, files = []) {
  const scores = {
    completeness: 0,
    documentation: 0,
    freshness: 0,
    format: 0,
  }

  // --- Completeness ---
  let completenessPoints = 0
  if (dataset.title) completenessPoints += 15
  if (dataset.description && dataset.description.length > 50) completenessPoints += 20
  if (dataset.category) completenessPoints += 10
  if (dataset.license) completenessPoints += 10
  if (dataset.geographicScope?.length > 0) completenessPoints += 15
  if (dataset.temporalCoverage) completenessPoints += 15
  if (dataset.source) completenessPoints += 10
  if (dataset.tags?.length > 0) completenessPoints += 5
  scores.completeness = Math.min(completenessPoints, 100)

  // --- Documentation ---
  let docPoints = 0
  if (dataset.description && dataset.description.length > 200) docPoints += 30
  if (dataset.methodology) docPoints += 30
  const filesWithColumns = files.filter((f) => f.columns?.length > 0)
  docPoints += Math.min((filesWithColumns.length / Math.max(files.length, 1)) * 40, 40)
  scores.documentation = Math.min(docPoints, 100)

  // --- Freshness ---
  const daysSinceUpdate =
    (Date.now() - new Date(dataset.updatedAt || dataset.createdAt)) / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate < 30) scores.freshness = 100
  else if (daysSinceUpdate < 90) scores.freshness = 80
  else if (daysSinceUpdate < 180) scores.freshness = 60
  else if (daysSinceUpdate < 365) scores.freshness = 40
  else scores.freshness = 20

  // --- Format ---
  const preferredFormats = ['csv', 'json', 'geojson', 'parquet']
  const formatScores = files.map((f) => {
    const fmt = f.format?.toLowerCase()
    if (preferredFormats.includes(fmt)) return 100
    if (['xlsx', 'xls'].includes(fmt)) return 70
    if (fmt === 'pdf') return 40
    return 50
  })
  scores.format =
    formatScores.length > 0
      ? Math.round(formatScores.reduce((a, b) => a + b, 0) / formatScores.length)
      : 50

  // --- Overall (weighted) ---
  scores.overall = Math.round(
    scores.completeness * 0.3 +
    scores.documentation * 0.25 +
    scores.freshness * 0.2 +
    scores.format * 0.25,
  )

  return scores
}
