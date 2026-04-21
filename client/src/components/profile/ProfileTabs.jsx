import { cn } from '../../lib/utils'

export function ProfileTabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn('flex border-b border-stone-200', className)}>
      {tabs.map(({ key, label, count }) => {
        const isActive = key === activeTab
        return (
          <button
            key={key}
            onClick={() => onChange?.(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              isActive
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300',
            )}
          >
            {label}
            {count != null && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                  isActive
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-stone-100 text-stone-500',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
