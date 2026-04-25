import { CheckCircle, FileText, Clock, Code } from 'lucide-react'

function ScoreBar({ label, score, icon: Icon }) {
  const getColorClass = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-stone-600">
          <Icon size={12} className="text-stone-400" />
          {label}
        </span>
        <span className="font-medium text-stone-700">{score}%</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function QualityScoreCard({ qualityScore }) {
  if (!qualityScore || typeof qualityScore.overall === 'undefined') {
    return null
  }

  const { overall, completeness, documentation, freshness, format } = qualityScore

  const getOverallLabel = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-700 bg-green-50' }
    if (score >= 60) return { text: 'Good', color: 'text-yellow-700 bg-yellow-50' }
    if (score >= 40) return { text: 'Fair', color: 'text-orange-700 bg-orange-50' }
    return { text: 'Needs Improvement', color: 'text-red-700 bg-red-50' }
  }

  const overallInfo = getOverallLabel(overall)

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-stone-800">Quality Score</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${overallInfo.color}`}>
          {overallInfo.text}
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-stone-200"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${(overall / 100) * 220} 220`}
              strokeLinecap="round"
              className={overall >= 60 ? 'text-green-500' : overall >= 40 ? 'text-orange-500' : 'text-red-500'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-stone-800">{overall}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ScoreBar label="Completeness" score={completeness} icon={CheckCircle} />
        <ScoreBar label="Documentation" score={documentation} icon={FileText} />
        <ScoreBar label="Freshness" score={freshness} icon={Clock} />
        <ScoreBar label="Format" score={format} icon={Code} />
      </div>
    </div>
  )
}
