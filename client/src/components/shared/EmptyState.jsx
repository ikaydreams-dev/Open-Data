import { cn } from '../../lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-stone-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-stone-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-stone-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
