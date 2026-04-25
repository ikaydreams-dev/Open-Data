import { Link } from 'react-router-dom'
import { Tag, FileText, Globe, Clock, Building2, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '../shared/Badge'
import { DatasetCategoryTag } from './DatasetCategoryTag'
import { DatasetLicenseBadge } from './DatasetLicenseBadge'

function MetaRow({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-stone-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <div className="text-sm text-stone-700">{children}</div>
      </div>
    </div>
  )
}

export function DatasetMetadataPanel({ dataset }) {
  if (!dataset) return null

  const {
    category,
    license,
    geographicScope,
    temporalCoverage,
    organization,
    uploader,
    updatedAt,
    tags,
  } = dataset

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3 text-sm">
        <MetaRow icon={Tag} label="Category">
          {category && <DatasetCategoryTag category={category} />}
        </MetaRow>

        <MetaRow icon={FileText} label="License">
          {license && <DatasetLicenseBadge license={license} />}
        </MetaRow>

        <MetaRow icon={Globe} label="Geographic Scope">
          {geographicScope?.length > 0 && geographicScope.join(', ')}
        </MetaRow>

        <MetaRow icon={Clock} label="Temporal Coverage">
          {temporalCoverage}
        </MetaRow>

        <MetaRow icon={Building2} label="Organization">
          {organization && (
            <Link
              to={`/organizations/${organization.slug}`}
              className="text-orange-700 hover:underline"
            >
              {organization.name}
            </Link>
          )}
        </MetaRow>

        <MetaRow icon={Calendar} label="Updated">
          {updatedAt && formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </MetaRow>
      </div>

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
      )}

      {(uploader || organization) && (
        <div className="text-sm text-stone-500">
          Uploaded by{' '}
          {uploader
            ? (
              <Link
                to={`/users/${uploader.username}`}
                className="text-orange-700 hover:underline font-medium"
              >
                {uploader.name}
              </Link>
            )
            : (
              <Link
                to={`/organizations/${organization?.slug}`}
                className="text-orange-700 hover:underline font-medium"
              >
                {organization?.name}
              </Link>
            )}
        </div>
      )}
    </div>
  )
}
