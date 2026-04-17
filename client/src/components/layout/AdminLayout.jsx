// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Database,
  ShieldCheck,
  BarChart2,
  Flag,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: Users,
  },
  {
    label: 'Datasets',
    to: '/admin/datasets',
    icon: Database,
  },
  {
    label: 'Moderation Queue',
    to: '/admin/moderation',
    icon: ShieldCheck,
  },
  {
    label: 'Flagged Content',
    to: '/admin/flagged',
    icon: Flag,
  },
  {
    label: 'Analytics',
    to: '/admin/analytics',
    icon: BarChart2,
  },
]

function SidebarLink({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
          isActive
            ? 'bg-orange-700 text-white'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={cn('shrink-0', isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-600')} />
          <span className="flex-1">{label}</span>
          {!isActive && <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-400" />}
        </>
      )}
    </NavLink>
  )
}

export function AdminLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    clearAuth()
    navigate('/')
    toast.success('Signed out.')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-stone-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-700">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900 leading-none">Admin Panel</p>
            <p className="text-xs text-stone-500 mt-0.5">OpenData Africa</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) => (
          <SidebarLink
            key={link.to}
            {...link}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-stone-200 px-3 py-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate leading-none">{user?.name}</p>
            <p className="text-xs text-stone-500 mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-stone-200 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-stone-200',
          'transform transition-transform duration-300 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Top bar — mobile only */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange-700" />
            <span className="text-sm font-semibold text-stone-900">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
