import { useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
    X, Database, Upload, LayoutDashboard,
    User, Settings, Key, LogOut, FolderOpen,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

// ── nav link helper ────────────────────────────────────────────────────────────
function MobileNavLink({ to, icon: Icon, children, onClick, danger = false }) {
    return (
        <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
        cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
           danger
           ? 'text-red-600 hover:bg-red-50'
           : isActive
           ? 'bg-orange-50 text-orange-700'
           : 'text-stone-700 hover:bg-stone-100',
        )
        }
        >
        {Icon && <Icon size={16} className="shrink-0" />}
        {children}
        </NavLink>
    )
}

// ── section divider ────────────────────────────────────────────────────────────
function Divider({ label }) {
    return (
        <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
        {label}
        </span>
        </div>
    )
}

// ── main component ─────────────────────────────────────────────────────────────
export function MobileMenu({ onLogout }) {
    const { user, isAuthenticated } = useAuthStore()
    const { mobileMenuOpen, setMobileMenuOpen } = useUiStore()

    const close = () => setMobileMenuOpen(false)

    // Lock body scroll while menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') close() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    if (!mobileMenuOpen) return null

        return (
            <>
            {/* Backdrop */}
            <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={close}
            aria-hidden="true"
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-xl flex flex-col md:hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-stone-100 shrink-0">
            <Link
            to="/"
            onClick={close}
            className="flex items-center gap-2 font-bold text-orange-700 text-base"
            >
            <Database size={20} />
            OpenData Africa
            </Link>
            <button
            onClick={close}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            aria-label="Close menu"
            >
            <X size={18} />
            </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

            <Divider label="Explore" />
            <MobileNavLink to="/datasets" icon={Database} onClick={close}>Datasets</MobileNavLink>
            <MobileNavLink to="/community" icon={LayoutDashboard} onClick={close}>Community</MobileNavLink>

            {isAuthenticated ? (
                <>
                <Divider label="My Work" />
                <MobileNavLink to="/datasets/upload" icon={Upload} onClick={close}>
                Upload Dataset
                </MobileNavLink>
                <MobileNavLink to="/my-datasets" icon={Database} onClick={close}>
                My Datasets
                </MobileNavLink>
                <MobileNavLink to="/workspaces" icon={FolderOpen} onClick={close}>
                Workspaces
                </MobileNavLink>

                <Divider label="Account" />
                <MobileNavLink to={`/users/${user?.username}`} icon={User} onClick={close}>
                Profile
                </MobileNavLink>
                <MobileNavLink to="/account/profile" icon={Settings} onClick={close}>
                Settings
                </MobileNavLink>
                <MobileNavLink to="/account/api-keys" icon={Key} onClick={close}>
                API Keys
                </MobileNavLink>

                {user?.role === 'admin' && (
                    <>
                    <Divider label="Admin" />
                    <MobileNavLink to="/admin" icon={LayoutDashboard} onClick={close}>
                    Admin Dashboard
                    </MobileNavLink>
                    </>
                )}
                </>
            ) : (
                <>
                <Divider label="Account" />
                </>
            )}
            </nav>

            {/* Auth footer */}
            <div className="shrink-0 border-t border-stone-100 px-3 py-3 space-y-1">
            {isAuthenticated ? (
                <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
                <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                </div>
                </div>
                <button
                onClick={() => { onLogout?.(); close() }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                <LogOut size={16} />
                Sign out
                </button>
                </>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                <Link
                to="/sign-in"
                onClick={close}
                className="flex items-center justify-center py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                Sign in
                </Link>
                <Link
                to="/sign-up"
                onClick={close}
                className="flex items-center justify-center py-2 rounded-lg bg-orange-700 text-sm font-medium text-white hover:bg-orange-800 transition-colors"
                >
                Sign up
                </Link>
                </div>
            )}
            </div>
            </div>
            </>
        )
}
