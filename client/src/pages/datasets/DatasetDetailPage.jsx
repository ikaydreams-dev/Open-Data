import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Download, FileText, Calendar, Tag, Globe, Clock, Building2, MessageSquare, Pencil } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { datasetsApi } from '../../api/datasets.api'
import { communityApi } from '../../api/community.api'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Table } from '../../components/shared/Table'
import { StarRating } from '../../components/shared/StarRating'
import { Textarea } from '../../components/shared/Textarea'
import { Input } from '../../components/shared/Input'
import { PageSpinner } from '../../components/shared/Spinner'
import { DATASET_CATEGORIES } from '../../lib/constants'
import { formatFileSize, formatNumber } from '../../lib/utils'

const TABS = ['Files', 'Reviews', 'Versions', 'Discussions']

function getCategoryLabel(value) {
  return DATASET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

function statusVariant(status) {
  return { approved: 'success', submitted: 'warning', under_review: 'info', rejected: 'danger' }[status] ?? 'default'
}

export default function DatasetDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Files')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [discussionTitle, setDiscussionTitle] = useState('')
  const [discussionBody, setDiscussionBody] = useState('')
  const [showDiscussionForm, setShowDiscussionForm] = useState(false)

  // Fetch dataset
  const { data: dataset, isLoading, isError } = useQuery({
    queryKey: ['dataset', slug],
    queryFn: () => datasetsApi.get(slug).then((r) => r.data),
    retry: false,
    onError: () => navigate('/404'),
  })

  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['dataset-reviews', slug],
    queryFn: () => datasetsApi.getReviews(slug).then((r) => r.data),
    enabled: !!dataset,
  })

  // Fetch versions
  const { data: versionsData } = useQuery({
    queryKey: ['dataset-versions', slug],
    queryFn: () => datasetsApi.getVersions(slug).then((r) => r.data),
    enabled: activeTab === 'Versions' && !!dataset,
  })

  // Fetch discussions
  const { data: discussionsData } = useQuery({
    queryKey: ['dataset-discussions', slug],
    queryFn: () => communityApi.listDiscussions({ dataset: slug }).then((r) => r.data),
    enabled: activeTab === 'Discussions' && !!dataset,
  })

  // Create discussion
  const discussionMutation = useMutation({
    mutationFn: (data) => communityApi.createDiscussion({ ...data, dataset: slug }),
    onSuccess: () => {
      toast.success('Discussion started')
      setDiscussionTitle('')
      setDiscussionBody('')
      setShowDiscussionForm(false)
      queryClient.invalidateQueries({ queryKey: ['dataset-discussions', slug] })
    },
    onError: () => toast.error('Failed to start discussion'),
  })

  // Like / Unlike
  const likeMutation = useMutation({
    mutationFn: () =>
      dataset?.likedByMe ? datasetsApi.unlike(slug) : datasetsApi.like(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataset', slug] }),
  })

  // Submit review
  const reviewMutation = useMutation({
    mutationFn: (data) => datasetsApi.createReview(slug, data),
    onSuccess: () => {
      toast.success('Review submitted')
      setReviewRating(0)
      setReviewComment('')
      queryClient.invalidateQueries({ queryKey: ['dataset-reviews', slug] })
    },
    onError: () => toast.error('Failed to submit review'),
  })

  function handleDownload(fileId, fileName) {
    datasetsApi.download(slug, fileId).then((res) => {
      const url = res.data?.url
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
      }
    }).catch(() => toast.error('Download failed'))
  }

  function handleSubmitReview(e) {
    e.preventDefault()
    if (!reviewRating) return toast.error('Please select a star rating')
    reviewMutation.mutate({ rating: reviewRating, comment: reviewComment })
  }

  function handleSubmitDiscussion(e) {
    e.preventDefault()
    if (!discussionTitle.trim()) return toast.error('Please enter a title')
    discussionMutation.mutate({ title: discussionTitle, body: discussionBody })
  }

  if (isLoading) return <PageSpinner />
  if (isError || !dataset) return null

  const reviews = reviewsData?.reviews ?? []
  const versions = versionsData?.versions ?? []
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const fileColumns = [
    { key: 'name', label: 'File Name' },
    { key: 'format', label: 'Format', render: (row) => <Badge>{row.format?.toUpperCase()}</Badge> },
    { key: 'size', label: 'Size', render: (row) => formatFileSize(row.size ?? 0) },
    {
      key: 'action', label: '',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => handleDownload(row._id, row.name)}>
          <Download size={13} /> Download
        </Button>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-stone-900 leading-snug">{dataset.title}</h1>
          <Badge variant={statusVariant(dataset.moderationStatus)} className="shrink-0 capitalize mt-1">
            {dataset.moderationStatus?.replace('_', ' ')}
          </Badge>
        </div>

        {dataset.description && (
          <p className="text-stone-600 text-sm leading-relaxed mb-4">{dataset.description}</p>
        )}

        {/* Stats + actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => isAuthenticated ? likeMutation.mutate() : navigate('/sign-in')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              dataset.likedByMe ? 'text-red-500' : 'text-stone-500 hover:text-red-400'
            }`}
          >
            <Heart size={16} className={dataset.likedByMe ? 'fill-red-500' : ''} />
            {formatNumber(dataset.likeCount ?? 0)}
          </button>

          <span className="flex items-center gap-1.5 text-sm text-stone-500">
            <Download size={16} />
            {formatNumber(dataset.downloadCount ?? 0)} downloads
          </span>

          <span className="flex items-center gap-1.5 text-sm text-stone-500">
            <FileText size={16} />
            {dataset.files?.length ?? 0} {dataset.files?.length === 1 ? 'file' : 'files'}
          </span>

          {avgRating && (
            <span className="flex items-center gap-1.5 text-sm text-stone-500">
              <StarRating value={Math.round(Number(avgRating))} readonly />
              {avgRating} ({reviews.length})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabs — left/main */}
        <div className="lg:col-span-2">
          <div className="flex border-b border-stone-200 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Files Tab */}
          {activeTab === 'Files' && (
            <Table
              columns={fileColumns}
              data={dataset.files ?? []}
              emptyMessage="No files attached to this dataset."
            />
          )}

          {/* Reviews Tab */}
          {activeTab === 'Reviews' && (
            <div className="space-y-5">
              {isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="bg-stone-50 rounded-lg p-4 space-y-3 border border-stone-200">
                  <p className="text-sm font-medium text-stone-700">Write a review</p>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                  <Textarea
                    placeholder="Share your thoughts about this dataset..."
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <Button type="submit" size="sm" loading={reviewMutation.isPending}>
                    Submit Review
                  </Button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="border-b border-stone-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-stone-800">
                        {review.user?.name ?? 'Anonymous'}
                      </span>
                      <span className="text-xs text-stone-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <StarRating value={review.rating} readonly />
                    {review.comment && (
                      <p className="text-sm text-stone-600 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'Versions' && (
            <div className="space-y-3">
              {versions.length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">No version history available.</p>
              ) : (
                versions.map((v) => (
                  <div key={v._id} className="flex items-start gap-3 border-b border-stone-100 pb-3">
                    <span className="shrink-0 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded">
                      v{v.versionNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700">{v.changelog ?? 'No changelog provided.'}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'Discussions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  {(discussionsData?.discussions ?? []).length} discussion{(discussionsData?.discussions ?? []).length !== 1 ? 's' : ''}
                </p>
                {isAuthenticated && !showDiscussionForm && (
                  <Button size="sm" onClick={() => setShowDiscussionForm(true)}>
                    <Pencil size={13} /> Start Discussion
                  </Button>
                )}
              </div>

              {showDiscussionForm && (
                <form onSubmit={handleSubmitDiscussion} className="bg-stone-50 rounded-lg p-4 space-y-3 border border-stone-200">
                  <p className="text-sm font-medium text-stone-700">New Discussion</p>
                  <Input
                    placeholder="Title"
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="What would you like to discuss about this dataset?"
                    rows={3}
                    value={discussionBody}
                    onChange={(e) => setDiscussionBody(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" loading={discussionMutation.isPending}>
                      Post
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowDiscussionForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {(discussionsData?.discussions ?? []).length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">No discussions yet. Be the first to start one.</p>
              ) : (
                (discussionsData?.discussions ?? []).map((d) => (
                  <Link
                    key={d._id}
                    to={`/community/${d._id}`}
                    className="flex items-start gap-3 border-b border-stone-100 pb-4 hover:bg-stone-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <MessageSquare size={15} className="text-stone-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 hover:text-orange-700 transition-colors">
                        {d.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400">
                        <span>{d.user?.name ?? 'Anonymous'}</span>
                        <span>{d.commentCount ?? 0} {d.commentCount === 1 ? 'reply' : 'replies'}</span>
                        <span>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Metadata sidebar */}
        <aside className="space-y-4">
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3 text-sm">
            <MetaRow icon={Tag} label="Category" value={dataset.category ? getCategoryLabel(dataset.category) : null} />
            <MetaRow icon={FileText} label="License" value={dataset.license?.toUpperCase()} />
            <MetaRow icon={Globe} label="Geographic Scope" value={dataset.geographicScope?.join(', ')} />
            <MetaRow icon={Clock} label="Temporal Coverage" value={dataset.temporalCoverage} />
            <MetaRow
              icon={Building2}
              label="Organization"
              value={
                dataset.organization
                  ? <Link to={`/organizations/${dataset.organization.slug}`} className="text-orange-700 hover:underline">{dataset.organization.name}</Link>
                  : null
              }
            />
            <MetaRow
              icon={Calendar}
              label="Updated"
              value={dataset.updatedAt ? formatDistanceToNow(new Date(dataset.updatedAt), { addSuffix: true }) : null}
            />
          </div>

          {dataset.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dataset.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {(dataset.uploader || dataset.organization) && (
            <div className="text-sm text-stone-500">
              Uploaded by{' '}
              {dataset.uploader
                ? <Link to={`/users/${dataset.uploader.username}`} className="text-orange-700 hover:underline font-medium">{dataset.uploader.name}</Link>
                : <Link to={`/organizations/${dataset.organization?.slug}`} className="text-orange-700 hover:underline font-medium">{dataset.organization?.name}</Link>
              }
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-stone-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-stone-700">{value}</p>
      </div>
    </div>
  )
}
