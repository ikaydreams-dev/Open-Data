import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Sidebar({
    children,
    title,
    width = 'w-56',
    mobileLabel = 'Filters',
    className,
    contentClassName,
    sticky = true,
}) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
        {/* ── Mobile toggle button ─────────────────────────────────────────── */}
        <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors mb-4"
        >
        <SlidersHorizontal size={14} />
        {mobileLabel}
        </button>

        {/* ── Mobile overlay ───────────────────────────────────────────────── */}
        {mobileOpen && (
            <>
            <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col lg:hidden">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-stone-100 shrink-0">
            <span className="text-sm font-semibold text-stone-800">
            {title ?? mobileLabel}
            </span>
            <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
            aria-label="Close"
            >
            <X size={16} />
            </button>
            </div>
            {/* Mobile content */}
            <div className={cn('flex-1 overflow-y-auto px-4 py-4', contentClassName)}>
            {children}
            </div>
            {/* Apply button */}
            <div className="shrink-0 border-t border-stone-100 px-4 py-3">
            <button
            onClick={() => setMobileOpen(false)}
            className="w-full py-2 bg-orange-700 text-white text-sm font-medium rounded-lg hover:bg-orange-800 transition-colors"
            >
            Apply
            </button>
            </div>
            </div>
            </>
        )}

        {/* ── Desktop panel ────────────────────────────────────────────────── */}
        <aside
        className={cn(
            'hidden lg:block shrink-0',
            width,
            sticky && 'sticky top-20 self-start',
            className,
        )}
        >
        {title && (
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            {title}
            </p>
        )}
        <div className={cn('space-y-5', contentClassName)}>
        {children}
        </div>
        </aside>
        </>
    )
}

export function SidebarLayout({ sidebar, children, gap = 'gap-8', className }) {
    return (
        <div className={cn('flex', gap, className)}>
        {sidebar}
        <div className="flex-1 min-w-0">
        {children}
        </div>
        </div>
    )
}
