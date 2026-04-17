import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { communityApi } from '../../api/community.api'
import { Pagination } from '../../components/shared/Pagination'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'

export default function DiscussionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const { data, isLoading } = useQuery({
    queryKey: ['discussions', page],
    queryFn: () => communityApi.listDiscussions({ page, limit: 20 }).then((r) => r.data),
  })

  const discussions = data?.discussions ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  function handlePageChange(newPage) {
    setSearchParams({ page: String(newPage) })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Discussions</h1>
        {!isLoading && (
          <p className="text-sm text-stone-500 mt-1">
            {total} {total === 1 ? 'discussion' : 'discussions'} across all datasets
          </p>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : discussions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description="Be the first to start a discussion on a dataset."
        />
      ) : (
        <>
          <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
            {discussions.map((d) => (
              <Link
                key={d._id}
                to={`/community/${d._id}`}
                className="flex items-start gap-4 px-5 py-4 bg-white hover:bg-stone-50 transition-colors"
              >
                <MessageSquare size={18} className="text-stone-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 hover:text-orange-700 transition-colors line-clamp-1">
                    {d.title}
                  </p>
                  {d.dataset && (
                    <p className="text-xs text-orange-700 mt-0.5 flex items-center gap-1">
                      <Database size={10} />
                      {d.dataset.title}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                    <span>{d.user?.name ?? 'Anonymous'}</span>
                    <span>{d.commentCount ?? 0} {d.commentCount === 1 ? 'reply' : 'replies'}</span>
                    <span>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
