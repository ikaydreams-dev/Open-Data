import { cn } from '../../lib/utils'

const LICENSE_STYLES = {
  cc0:         { label: 'CC0',         className: 'bg-green-100 text-green-800' },
  'cc-by':     { label: 'CC BY',       className: 'bg-blue-100 text-blue-800' },
  'cc-by-sa':  { label: 'CC BY-SA',    className: 'bg-blue-100 text-blue-800' },
  'cc-by-nc':  { label: 'CC BY-NC',    className: 'bg-amber-100 text-amber-800' },
  'odc-by':    { label: 'ODC-By',      className: 'bg-purple-100 text-purple-800' },
  odbl:        { label: 'ODbL',        className: 'bg-purple-100 text-purple-800' },
  proprietary: { label: 'Proprietary', className: 'bg-stone-100 text-stone-700' },
}

export function DatasetLicenseBadge({ license, className }) {
  const config = LICENSE_STYLES[license] ?? { label: license?.toUpperCase() ?? '—', className: 'bg-stone-100 text-stone-700' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
