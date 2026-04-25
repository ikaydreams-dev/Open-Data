import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { datasetsApi } from '../../api/datasets.api'
import { PageSpinner } from '../../components/shared/Spinner'
import { Badge } from '../../components/shared/Badge'
import { formatFileSize } from '../../lib/utils'

export default function DatasetVersionPage() {
  const { slug } = useParams()

  const { data: datasetData, isLoading: loadingDataset } = useQuery({
    queryKey: ['dataset', slug],
    queryFn: () => datasetsApi.get(slug).then((r) => r.data),
  })

  const { data: versionsData, isLoading: loadingVersions } = useQuery({
    queryKey: ['dataset-versions', slug],
    queryFn: () => datasetsApi.getVersions(slug).then((r) => r.data),
    enabled: !!slug,
  })

  const versions = versionsData?.versions ?? []
  const isLoading = loadingDataset || loadingVersions

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to={`/datasets/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to dataset
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Version History</h1>
        {datasetData?.title && (
          <p className="text-sm text-stone-500 mt-1">{datasetData.title}</p>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <FileText size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No version history available for this dataset.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-200" />

          <div className="space-y-6">
            {versions.map((v, idx) => (
              <div key={v._id} className="relative flex items-start gap-4">
                {/* Version dot */}
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10
                  ${idx === 0
                    ? 'bg-orange-700 text-white border-orange-700'
                    : 'bg-white text-stone-600 border-stone-300'
                  }`}
                >
                  v{v.versionNumber}
                </div>

                {/* Version card */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="bg-white border border-stone-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm font-semibold text-stone-800">
                          Version {v.versionNumber}
                        </span>
                        {idx === 0 && (
                          <Badge variant="success" className="ml-2">Latest</Badge>
                        )}
                      </div>
                      <span className="text-xs text-stone-400 shrink-0">
                        {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-stone-600 mb-3">
                      {v.changelog ?? 'No changelog provided.'}
                    </p>

                    {v.createdBy?.name && (
                      <p className="text-xs text-stone-400 mb-3">
                        Uploaded by{' '}
                        <span className="text-stone-600 font-medium">{v.createdBy.name}</span>
                      </p>
                    )}

                    {/* File snapshot */}
                    {v.files?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1 uppercase tracking-wide">
                          Files in this version
                        </p>
                        <ul className="divide-y divide-stone-100 border border-stone-100 rounded-md overflow-hidden">
                          {v.files.map((file, i) => (
                            <li key={i} className="flex items-center gap-3 px-3 py-2">
                              <FileText size={13} className="text-stone-400 shrink-0" />
                              <span className="flex-1 text-xs text-stone-700 truncate">
                                {file.name}
                              </span>
                              {file.format && (
                                <Badge variant="default">{file.format.toUpperCase()}</Badge>
                              )}
                              {file.size > 0 && (
                                <span className="text-xs text-stone-400 shrink-0">
                                  {formatFileSize(file.size)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
