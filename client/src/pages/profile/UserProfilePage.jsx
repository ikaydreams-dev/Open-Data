import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Download, Database, Pencil, UserX } from 'lucide-react'
import { format } from 'date-fns'
import { usersApi } from '../../api/users.api'
import { useAuthStore } from '../../store/authStore'
import { DatasetCard } from '../../components/datasets/DatasetCard'
import { Pagination } from '../../components/shared/Pagination'
import { PageSpinner } from '../../components/shared/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Badge } from '../../components/shared/Badge'
import { formatNumber } from '../../lib/utils'

const roleVariant = { admin: 'danger', researcher: 'primary', contributor: 'info', institution: 'warning' }

function Initials({ name }) {
  const parts = (name ?? '').trim().split(' ')
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (parts[0]?.[0] ?? '?')
  return (
    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 text-2xl font-bold uppercase">
      {letters}
    </div>
  )
}

export default function UserProfilePage() {
  const { username } = useParams()
  const { user: authUser } = useAuthStore()
  const [page, setPage] = useState(1)

  const { data: profile, isLoading: profileLoading, isError } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => usersApi.getProfile(username).then((r) => r.data),
    retry: false,
  })

  const { data: datasetsData, isLoading: datasetsLoading } = useQuery({
    queryKey: ['user-datasets', username, page],
    queryFn: () => usersApi.getUserDatasets(username, { page, limit: 12 }).then((r) => r.data),
    enabled: !!profile,
  })

  const datasets = datasetsData?.datasets ?? []
  const totalPages = datasetsData?.totalPages ?? 1
  const isOwnProfile = authUser?.username === username

  if (profileLoading) return <PageSpinner />

  if (isError || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={UserX}
          title="User not found"
          description={`No account exists with the username "@${username}".`}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        {profile.avatar
          ? <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
          : <Initials name={profile.name} />
        }

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-stone-900">{profile.name}</h1>
            <Badge variant={roleVariant[profile.role] ?? 'default'} className="capitalize">
              {profile.role}
            </Badge>
            {isOwnProfile && (
              <Link
                to="/account/profile"
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-orange-700 transition-colors ml-auto"
              >
                <Pencil size={13} /> Edit Profile
              </Link>
            )}
          </div>

          <p className="text-sm text-stone-500 mb-3">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-stone-600 mb-4 leading-relaxed max-w-xl">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-5 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Database size={14} />
              <span className="font-semibold text-stone-800">{formatNumber(profile.datasetCount ?? 0)}</span> datasets
            </span>
            <span className="flex items-center gap-1.5">
              <Download size={14} />
              <span className="font-semibold text-stone-800">{formatNumber(profile.totalDownloads ?? 0)}</span> downloads
            </span>
            {profile.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Datasets */}
      <div>
        <h2 className="text-base font-semibold text-stone-800 mb-4">
          Datasets{profile.datasetCount ? ` (${profile.datasetCount})` : ''}
        </h2>

        {datasetsLoading ? (
          <PageSpinner />
        ) : datasets.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No public datasets"
            description={isOwnProfile ? "You haven't uploaded any datasets yet." : `${profile.name} hasn't published any datasets yet.`}
            action={
              isOwnProfile
                ? <Link to="/datasets/upload" className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800 transition-colors">Upload a Dataset</Link>
                : null
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {datasets.map((dataset) => (
                <DatasetCard key={dataset._id ?? dataset.slug} dataset={dataset} />
              ))}
            </div>
            <div className="flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
