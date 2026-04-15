import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutDashboard, Users, Database, ShieldCheck, BarChart2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { lazy, Suspense } from 'react'
import { PageSpinner } from '../../components/shared/Spinner'

const Dashboard  = lazy(() => import('./Dashboard'))
const UsersPage  = lazy(() => import('./Users'))
const Datasets   = lazy(() => import('./Datasets'))
const Moderation = lazy(() => import('./Moderation'))
const Analytics  = lazy(() => import('./Analytics'))

const TABS = [
  { key: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, component: Dashboard },
{ key: 'users',      label: 'Users',      icon: Users,           component: UsersPage },
{ key: 'datasets',   label: 'Datasets',   icon: Database,        component: Datasets },
{ key: 'moderation', label: 'Moderation', icon: ShieldCheck,     component: Moderation },
{ key: 'analytics',  label: 'Analytics',  icon: BarChart2,       component: Analytics },
]

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  function setTab(key) {
    setSearchParams({ tab: key })
  }

  const ActivePage = TABS.find((t) => t.key === activeTab)?.component ?? Dashboard

  return (
    <div className="min-h-screen bg-stone-50">
    {/* Admin Tab Bar */}
    <div className="border-b border-stone-200 bg-white sticky top-0 z-10">
    <div className="max-w-6xl mx-auto px-4">
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
    {TABS.map(({ key, label, icon: Icon }) => (
      <button
      key={key}
      onClick={() => setTab(key)}
      className={cn(
        'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
        activeTab === key
        ? 'border-orange-700 text-orange-700'
        : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300',
      )}
      >
      <Icon size={15} />
      {label}
      </button>
    ))}
    </nav>
    </div>
    </div>

    {/* Page Content */}
    <Suspense fallback={<PageSpinner />}>
    <ActivePage />
    </Suspense>
    </div>
  )
}
