// src/components/workspaces/KernelStatusBadge.jsx
// Displays the real-time execution status of a workspace kernel.
// Kernel lifecycle: stopped → starting → idle → busy/running → stopping → stopped | error
import { cn } from '../../lib/utils'

const STATUS_CONFIG = {
  idle: {
    label: 'Idle',
    dot: 'bg-green-400',
    badge: 'bg-green-50 text-green-700 border-green-200',
    pulse: false,
  },
  running: {
    label: 'Running',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    pulse: true,
  },
  busy: {
    label: 'Busy',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    pulse: true,
  },
  starting: {
    label: 'Starting',
    dot: 'bg-orange-400',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    pulse: true,
  },
  stopping: {
    label: 'Stopping',
    dot: 'bg-stone-400',
    badge: 'bg-stone-50 text-stone-600 border-stone-200',
    pulse: true,
  },
  stopped: {
    label: 'Stopped',
    dot: 'bg-stone-300',
    badge: 'bg-stone-50 text-stone-500 border-stone-200',
    pulse: false,
  },
  error: {
    label: 'Error',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    pulse: false,
  },
}

const sizes = {
  sm: { badge: 'px-1.5 py-0.5 text-xs gap-1', dot: 'w-1.5 h-1.5' },
  md: { badge: 'px-2.5 py-1 text-xs gap-1.5', dot: 'w-2 h-2' },
  lg: { badge: 'px-3 py-1.5 text-sm gap-2', dot: 'w-2.5 h-2.5' },
}

export function KernelStatusBadge({ status = 'stopped', size = 'md', className }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.stopped
  const s = sizes[size]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        s.badge,
        config.badge,
        className,
      )}
    >
      {/* Animated dot */}
      <span className="relative inline-flex shrink-0">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', s.dot, config.dot)} />
      </span>
      {config.label}
    </span>
  )
}
