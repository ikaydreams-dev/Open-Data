import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export function PageHeader({
    title,
    description,
    action,
    breadcrumb,
    border = false,
    size = 'md',
    className,
}) {
    const titleSizes = {
        sm: 'text-lg font-semibold',
        md: 'text-2xl font-bold',
        lg: 'text-3xl font-bold',
    }

    return (
        <div
        className={cn(
            'mb-6',
            border && 'pb-5 border-b border-stone-200',
            className,
        )}
        >
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 mb-2 flex-wrap">
            {breadcrumb.map((crumb, idx) => {
                const isLast = idx === breadcrumb.length - 1
                return (
                    <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && (
                        <ChevronRight size={13} className="text-stone-300 shrink-0" />
                    )}
                    {crumb.to && !isLast ? (
                        <Link
                        to={crumb.to}
                        className="text-xs text-stone-500 hover:text-orange-700 transition-colors"
                        >
                        {crumb.label}
                        </Link>
                    ) : (
                        <span
                        className={cn(
                            'text-xs',
                            isLast ? 'text-stone-700 font-medium' : 'text-stone-400',
                        )}
                        >
                        {crumb.label}
                        </span>
                    )}
                    </span>
                )
            })}
            </nav>
        )}

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
        <h1 className={cn('text-stone-900 leading-tight', titleSizes[size])}>
        {title}
        </h1>
        {description && (
            <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            {description}
            </p>
        )}
        </div>

        {action && (
            <div className="shrink-0 flex items-center gap-2">
            {action}
            </div>
        )}
        </div>
        </div>
    )
}
